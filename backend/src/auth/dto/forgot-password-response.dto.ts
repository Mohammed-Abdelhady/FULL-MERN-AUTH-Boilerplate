import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from '../../common/dto/api-response.dto';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Email address where reset code was sent',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset code sent to your email',
  })
  message!: string;

  static success(email: string): ApiResponse<ForgotPasswordResponseDto> {
    const dto = new ForgotPasswordResponseDto();
    dto.email = email;
    dto.message = 'Password reset code sent to your email';
    return ApiResponse.success(dto, 'Password reset code sent successfully');
  }
}
