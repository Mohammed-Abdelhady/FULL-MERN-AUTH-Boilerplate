export interface PendingRegistration {
  email: string;
  hashedPassword: string;
  name: string;
  hashedCode: string;
  attempts: number;
  expiresAt: Date;
}
