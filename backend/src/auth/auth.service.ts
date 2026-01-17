import { Injectable, Logger, HttpStatus } from '@nestjs/common';
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
import {
  PendingPasswordReset,
  PendingPasswordResetDocument,
} from './schemas/pending-password-reset.schema';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { ActivateResponseDto } from './dto/activate-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { ResetPasswordResponseDto } from './dto/reset-password-response.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { HashService } from '../common/services/hash.service';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/enums/error-code.enum';
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
    @InjectModel(PendingPasswordReset.name)
    private pendingPasswordResetModel: Model<PendingPasswordResetDocument>,
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
  async register(dto: RegisterDto): Promise<ApiResponse<RegisterResponseDto>> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        'Email already registered',
        HttpStatus.CONFLICT,
      );
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
      throw new AppException(
        ErrorCode.EMAIL_SEND_FAILED,
        'Failed to send activation email',
        HttpStatus.BAD_REQUEST,
      );
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
  ): Promise<ApiResponse<ActivateResponseDto>> {
    // Find pending registration (select hidden fields for verification)
    const pending = await this.pendingRegistrationModel
      .findOne({ email: dto.email })
      .select('+hashedPassword +hashedCode');

    if (!pending) {
      throw new AppException(
        ErrorCode.NO_PENDING_REGISTRATION,
        'No pending registration found',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if expired
    if (new Date() > pending.expiresAt) {
      await this.pendingRegistrationModel.deleteOne({ email: dto.email });
      throw new AppException(
        ErrorCode.ACTIVATION_CODE_EXPIRED,
        'Activation code has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check attempts
    if (pending.attempts >= this.maxAttempts) {
      await this.pendingRegistrationModel.deleteOne({ email: dto.email });
      throw new AppException(
        ErrorCode.MAX_ATTEMPTS_EXCEEDED,
        'Maximum attempts exceeded. Please register again.',
        HttpStatus.UNAUTHORIZED,
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
      throw new AppException(
        ErrorCode.ACTIVATION_CODE_INVALID,
        `Invalid code. ${remainingAttempts} attempts remaining.`,
        HttpStatus.BAD_REQUEST,
        { remainingAttempts },
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

  /**
   * Login user with email and password
   * @param dto - Login data
   * @param response - Express response object for setting cookie
   * @throws UnauthorizedException for invalid credentials
   */
  async login(
    dto: LoginDto,
    response: Response,
  ): Promise<ApiResponse<LoginResponseDto>> {
    // Find user with password field selected
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!user) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Compare password
    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.password!,
    );

    if (!isPasswordValid) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Create session
    const userAgent = response.req.headers['user-agent'] || 'Unknown';
    const ip = response.req.ip || '127.0.0.1';
    const sessionToken = await this.sessionService.createSession(
      user._id,
      userAgent,
      ip,
    );

    this.logger.log(`User logged in: ${user.email}`);

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

    return LoginResponseDto.success({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
    });
  }

  /**
   * Logout user by invalidating session
   * @param sessionToken - Session token to invalidate
   * @returns Success message
   */
  async logout(
    sessionToken: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const invalidated =
      await this.sessionService.invalidateSession(sessionToken);

    if (!invalidated) {
      throw new AppException(
        ErrorCode.SESSION_INVALID,
        'Invalid session',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.log(`User logged out with token: ${sessionToken}`);

    return ApiResponse.success({ message: 'Logout successful' });
  }

  /**
   * Request password reset by sending 6-digit code to email
   * @param dto - Forgot password data
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException if email sending fails
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<ApiResponse<ForgotPasswordResponseDto>> {
    // Check if user exists
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND_FOR_RESET,
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if pending reset exists (select hidden field for update)
    const existingReset = await this.pendingPasswordResetModel
      .findOne({ email: dto.email })
      .select('+hashedCode');

    // Generate cryptographically secure 6-digit reset code
    const code = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);

    // Calculate expiry
    const expiresAt = new Date(Date.now() + this.codeExpiresIn);

    if (existingReset) {
      // Update existing pending reset
      existingReset.hashedCode = hashedCode;
      existingReset.attempts = 0;
      existingReset.expiresAt = expiresAt;
      await existingReset.save();

      this.logger.log(`Updated pending password reset for ${dto.email}`);
    } else {
      // Create new pending reset
      await this.pendingPasswordResetModel.create({
        email: dto.email,
        hashedCode,
        attempts: 0,
        expiresAt,
      });

      this.logger.log(`Created pending password reset for ${dto.email}`);
    }

    // Send password reset email
    try {
      await this.mailService.sendPasswordResetCode(dto.email, code, user.name);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new AppException(
        ErrorCode.EMAIL_SEND_FAILED,
        'Failed to send password reset email',
        HttpStatus.BAD_REQUEST,
      );
    }

    return ForgotPasswordResponseDto.success(dto.email);
  }

  /**
   * Reset password using email and 6-digit code
   * @param dto - Reset password data
   * @throws BadRequestException for invalid/expired code
   * @throws UnauthorizedException for max attempts exceeded
   */
  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<ApiResponse<ResetPasswordResponseDto>> {
    // Find pending reset (select hidden field for verification)
    const pending = await this.pendingPasswordResetModel
      .findOne({ email: dto.email })
      .select('+hashedCode');

    if (!pending) {
      throw new AppException(
        ErrorCode.NO_PENDING_PASSWORD_RESET,
        'No password reset request found',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if expired
    if (new Date() > pending.expiresAt) {
      await this.pendingPasswordResetModel.deleteOne({ email: dto.email });
      throw new AppException(
        ErrorCode.PASSWORD_RESET_CODE_EXPIRED,
        'Password reset code has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check attempts
    if (pending.attempts >= this.maxAttempts) {
      await this.pendingPasswordResetModel.deleteOne({ email: dto.email });
      throw new AppException(
        ErrorCode.MAX_ATTEMPTS_EXCEEDED,
        'Maximum attempts exceeded. Please request a new code.',
        HttpStatus.UNAUTHORIZED,
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
      throw new AppException(
        ErrorCode.PASSWORD_RESET_CODE_INVALID,
        `Invalid code. ${remainingAttempts} attempts remaining.`,
        HttpStatus.BAD_REQUEST,
        { remainingAttempts },
      );
    }

    // Find user and update password
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND_FOR_RESET,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Hash new password
    const hashedPassword = await this.hashService.hash(dto.newPassword);
    user.password = hashedPassword;
    await user.save();

    this.logger.log(`Password reset successful for: ${user.email}`);

    // Delete pending reset
    await this.pendingPasswordResetModel.deleteOne({ email: dto.email });

    return ResetPasswordResponseDto.success();
  }
}
