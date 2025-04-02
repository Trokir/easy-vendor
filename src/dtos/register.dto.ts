import { IsEmail, IsString, IsBoolean, MinLength, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptedTerms: boolean;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
    message: 'Invalid domain format',
  })
  domain?: string;
}
