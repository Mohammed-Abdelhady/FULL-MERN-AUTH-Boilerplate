export class LoginResponseDto {
  message!: string;
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };

  static success(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  }): LoginResponseDto {
    return {
      message: 'Login successful',
      user,
    };
  }
}
