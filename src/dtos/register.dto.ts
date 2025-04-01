import { IsEmail, IsString, IsBoolean, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptedTerms: boolean;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  domain?: string;
} 