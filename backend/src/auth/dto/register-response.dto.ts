import { ApiResponse } from '../../common/dto/api-response.dto';

/**
 * Response DTO for successful registration
 */
export class RegisterResponseDto {
  email?: string;

  static success(email: string): ApiResponse<RegisterResponseDto> {
    const dto = new RegisterResponseDto();
    dto.email = email;
    return ApiResponse.success(dto, 'Activation code sent to your email');
  }
}
