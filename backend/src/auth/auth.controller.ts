import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Activate account with email and code
   * POST /api/auth/activate
   */
  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Body() dto: ActivateDto, @Res() response: Response) {
    const result = await this.authService.activate(dto, response);
    return response.status(HttpStatus.OK).json(result);
  }

  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(dto, response);
    return response.status(HttpStatus.OK).json(result);
  }

  /**
   * Logout user by invalidating session
   * POST /api/auth/logout
   * Requires authentication
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res() response: Response) {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const sessionToken = request.cookies?.[cookieName];

    const result = await this.authService.logout(
      (sessionToken as string | undefined) ?? '',
    );

    // Clear session cookie
    response.clearCookie(cookieName, {
      path: '/',
    });

    return response.status(HttpStatus.OK).json(result);
  }
}
