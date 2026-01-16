/**
 * Standardized user response DTO
 * Used across auth and user modules for consistent API responses
 */
export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: string;

  /**
   * Create a UserResponseDto from a user document
   * @param user - User document with _id, email, name, role
   */
  static fromDocument(user: {
    _id: { toString(): string };
    email: string;
    name: string;
    role: string;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id.toString();
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    return dto;
  }
}
