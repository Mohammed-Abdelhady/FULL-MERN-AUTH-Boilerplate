import { UserResponseDto } from '../../common/dto/user-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';

/**
 * Response DTO for successful account activation
 */
export class ActivateResponseDto {
  user!: UserResponseDto;

  static success(user: {
    _id: { toString(): string };
    email: string;
    name: string;
    role: string;
  }): ApiResponse<ActivateResponseDto> {
    const dto = new ActivateResponseDto();
    dto.user = UserResponseDto.fromDocument(user);
    return ApiResponse.success(dto, 'Account activated successfully');
  }
}
