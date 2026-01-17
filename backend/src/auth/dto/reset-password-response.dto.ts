import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from '../../common/dto/api-response.dto';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successful',
  })
  message!: string;

  static success(): ApiResponse<ResetPasswordResponseDto> {
    const dto = new ResetPasswordResponseDto();
    dto.message = 'Password reset successful';
    return ApiResponse.success(
      dto,
      'Your password has been reset successfully',
    );
  }
}
