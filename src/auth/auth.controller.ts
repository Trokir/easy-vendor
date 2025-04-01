import { Controller, Post, Body, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dtos/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new vendor' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Terms of Service not accepted' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'User already exists' 
  })
  async register(
    @Body() dto: RegisterDto,
    @Ip() ip: string
  ): Promise<{ id: number }> {
    return this.authService.register(dto, ip);
  }
} 