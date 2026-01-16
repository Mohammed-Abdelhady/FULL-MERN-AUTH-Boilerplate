/**
 * Response DTO for successful registration
 */
export class RegisterResponseDto {
  message!: string;
  email?: string;

  static success(email: string): RegisterResponseDto {
    const dto = new RegisterResponseDto();
    dto.message = 'Activation code sent to your email';
    dto.email = email;
    return dto;
  }
}
