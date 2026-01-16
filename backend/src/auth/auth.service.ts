import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as crypto from 'crypto';
import { User, UserDocument } from '../user/schemas/user.schema';
import {
  PendingRegistration,
  PendingRegistrationDocument,
} from './schemas/pending-registration.schema';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { ActivateResponseDto } from './dto/activate-response.dto';
import { HashService } from '../common/services/hash.service';
import { MailService } from '../mail/mail.service';
import { SessionService } from './services/session.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly codeExpiresIn: number;
  private readonly maxAttempts: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PendingRegistration.name)
    private pendingRegistrationModel: Model<PendingRegistrationDocument>,
    private readonly hashService: HashService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.codeExpiresIn = this.configService.get<number>(
      'activation.codeExpiresIn',
      900000,
    );
    this.maxAttempts = this.configService.get<number>(
      'activation.maxAttempts',
      5,
    );
  }

  /**
   * Register a new user and send activation code
   * @param dto - Registration data
   * @throws ConflictException if email already exists
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if pending registration exists (select hidden fields for update)
    const existingPending = await this.pendingRegistrationModel
      .findOne({ email: dto.email })
      .select('+hashedPassword +hashedCode');

    // Hash password
    const hashedPassword = await this.hashService.hash(dto.password);

    // Generate cryptographically secure 6-digit activation code
    const code = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);

    // Calculate expiry
    const expiresAt = new Date(Date.now() + this.codeExpiresIn);

    if (existingPending) {
      // Update existing pending registration
      existingPending.hashedPassword = hashedPassword;
      existingPending.name = dto.name;
      existingPending.hashedCode = hashedCode;
      existingPending.attempts = 0;
      existingPending.expiresAt = expiresAt;
      await existingPending.save();

      this.logger.log(`Updated pending registration for ${dto.email}`);
    } else {
      // Create new pending registration
      await this.pendingRegistrationModel.create({
        email: dto.email,
        hashedPassword,
        name: dto.name,
        hashedCode,
        attempts: 0,
        expiresAt,
      });

      this.logger.log(`Created pending registration for ${dto.email}`);
    }

    // Send activation email
    try {
      await this.mailService.sendActivationCode(dto.email, code, dto.name);
    } catch (error) {
      this.logger.error(
        `Failed to send activation email: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to send activation email');
    }

    return RegisterResponseDto.success(dto.email);
  }

  /**
   * Activate account using email and code
   * @param dto - Activation data
   * @param response - Express response object for setting cookie
   * @throws BadRequestException for invalid/expired code
   * @throws UnauthorizedException for max attempts exceeded
   */
  async activate(
    dto: ActivateDto,
    response: Response,
  ): Promise<ActivateResponseDto> {
    // Find pending registration (select hidden fields for verification)
    const pending = await this.pendingRegistrationModel
      .findOne({ email: dto.email })
      .select('+hashedPassword +hashedCode');

    if (!pending) {
      throw new BadRequestException('No pending registration found');
    }

    // Check if expired
    if (new Date() > pending.expiresAt) {
      await this.pendingRegistrationModel.deleteOne({ email: dto.email });
      throw new BadRequestException('Activation code has expired');
    }

    // Check attempts
    if (pending.attempts >= this.maxAttempts) {
      await this.pendingRegistrationModel.deleteOne({ email: dto.email });
      throw new UnauthorizedException(
        'Maximum attempts exceeded. Please register again.',
      );
    }

    // Verify code
    const isCodeValid = await this.hashService.compare(
      dto.code,
      pending.hashedCode,
    );

    if (!isCodeValid) {
      // Increment attempts
      pending.attempts += 1;
      await pending.save();

      const remainingAttempts = this.maxAttempts - pending.attempts;
      throw new BadRequestException(
        `Invalid code. ${remainingAttempts} attempts remaining.`,
      );
    }

    // Create user
    const user = await this.userModel.create({
      email: pending.email,
      password: pending.hashedPassword,
      name: pending.name,
      isVerified: true,
    });

    this.logger.log(`User created: ${user.email}`);

    // Create session
    const userAgent = response.req.headers['user-agent'] || 'Unknown';
    const ip = response.req.ip || '127.0.0.1';
    const sessionToken = await this.sessionService.createSession(
      user._id,
      userAgent,
      ip,
    );

    // Delete pending registration
    await this.pendingRegistrationModel.deleteOne({ email: dto.email });

    // Set HTTP-only cookie
    const cookieName = this.configService.get<string>(
      'session.cookieName',
      'sid',
    );
    const cookieMaxAge = this.configService.get<number>(
      'session.cookieMaxAge',
      604800000,
    );

    response.cookie(cookieName, sessionToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return ActivateResponseDto.success(user);
  }
}
