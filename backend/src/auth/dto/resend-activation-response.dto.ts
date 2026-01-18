import { ApiResponse } from '../../common/dto/api-response.dto';

export class ResendActivationResponseDto {
  email!: string;

  static success(email: string): ApiResponse<ResendActivationResponseDto> {
    const dto = new ResendActivationResponseDto();
    dto.email = email;
    return ApiResponse.success(dto, 'Activation code sent to your email');
  }
}
