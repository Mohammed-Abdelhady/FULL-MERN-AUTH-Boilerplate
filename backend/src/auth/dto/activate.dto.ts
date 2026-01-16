import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ActivateDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Code must contain only digits' })
  code!: string;
}
