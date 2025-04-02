import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CCPAService } from '../../services/privacy/ccpaService';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { User } from '../../decorators/user.decorator';

@Controller('api/privacy/ccpa')
export class CCPAController {
  constructor(private readonly ccpaService: CCPAService) {}

  @Post('opt-out')
  @UseGuards(JwtAuthGuard)
  async setOptOut(@User('id') userId: number): Promise<void> {
    await this.ccpaService.setOptOut(userId, true);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getOptOutStatus(@User('id') userId: number): Promise<{ optedOut: boolean }> {
    const optedOut = await this.ccpaService.getOptOutStatus(userId);
    return { optedOut };
  }

  @Post('data-deletion')
  @UseGuards(JwtAuthGuard)
  async requestDataDeletion(
    @User('id') userId: number,
    @Body('reason') reason?: string,
  ): Promise<{ requestId: string }> {
    const requestId = await this.ccpaService.requestDataDeletion(userId, reason);
    return { requestId };
  }

  @Get('data-categories')
  async getDataCategories() {
    return this.ccpaService.getDataCategories();
  }
} 