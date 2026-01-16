import { UserResponseDto } from '../../common/dto/user-response.dto';

/**
 * Response DTO for successful account activation
 */
export class ActivateResponseDto {
  message!: string;
  user!: UserResponseDto;

  static success(user: {
    _id: { toString(): string };
    email: string;
    name: string;
    role: string;
  }): ActivateResponseDto {
    const dto = new ActivateResponseDto();
    dto.message = 'Account activated successfully';
    dto.user = UserResponseDto.fromDocument(user);
    return dto;
  }
}
