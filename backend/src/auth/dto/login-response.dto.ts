import { ApiResponse } from '../../common/dto/api-response.dto';
import { AuthProvider } from '../../user/enums/auth-provider.enum';

export class LoginResponseDto {
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
    authProvider: AuthProvider;
    isVerified: boolean;
  };

  static success(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    authProvider: AuthProvider;
    isVerified: boolean;
  }): ApiResponse<LoginResponseDto> {
    const dto = new LoginResponseDto();
    dto.user = user;
    return ApiResponse.success(dto, 'Login successful');
  }
}
