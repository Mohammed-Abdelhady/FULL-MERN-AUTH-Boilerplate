import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Activate account with email and code
   * POST /api/auth/activate
   */
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Body() dto: ActivateDto, @Res() response: Response) {
    const result = await this.authService.activate(dto, response);
    return response.status(HttpStatus.OK).json(result);
  }
}
