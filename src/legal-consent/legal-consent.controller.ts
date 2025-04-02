import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LegalConsentService } from './legal-consent.service';
import { AuthGuard } from '../guards/auth.guard';
import { RecordConsentDto } from './dto/record-consent.dto';
import { ConsentStatusDto } from './dto/consent-status.dto';
import { ConsentHistoryDto } from './dto/consent-history.dto';
import { ServiceContainer } from '../services/ServiceContainer';

@ApiTags('Legal Consent')
@Controller('legal-consent')
export class LegalConsentController {
  private readonly legalConsentService: LegalConsentService;

  constructor(private readonly serviceContainer: ServiceContainer) {
    this.legalConsentService = this.serviceContainer.getLegalConsentService();
  }

  @Post('record')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new consent' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Consent recorded successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async recordConsent(@Body() dto: RecordConsentDto, @Ip() ip: string): Promise<void> {
    await this.legalConsentService.recordConsent(dto, ip);
  }

  @Get('status')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get consent status' })
  @ApiResponse({ status: HttpStatus.OK, type: ConsentStatusDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiQuery({ name: 'type', required: true, enum: ['terms', 'privacy', 'cookies'] })
  async getConsentStatus(
    @Query('userId') userId: number,
    @Query('type') type: string
  ): Promise<ConsentStatusDto> {
    return this.legalConsentService.getConsentStatus(userId, type);
  }

  @Get('history/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get consent history' })
  @ApiResponse({ status: HttpStatus.OK, type: [ConsentHistoryDto] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['terms', 'privacy', 'cookies'] })
  async getConsentHistory(
    @Param('userId') userId: number,
    @Query('type') type?: string
  ): Promise<ConsentHistoryDto[]> {
    return this.legalConsentService.getConsentHistory(userId, type);
  }
}
