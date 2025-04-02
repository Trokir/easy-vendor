import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DmcaReportService } from '../services/dmca-report.service';
import { CreateDmcaReportDto, UpdateDmcaReportDto } from '../dto/dmca-report.dto';
import { DmcaReport } from '../entities/dmca-report.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('dmca-reports')
export class DmcaReportController {
  constructor(private readonly dmcaReportService: DmcaReportService) {}

  /**
   * Создание нового DMCA отчета
   */
  @Post()
  async create(@Body() createDmcaReportDto: CreateDmcaReportDto): Promise<DmcaReport> {
    // Проверяем, что заявитель подтвердил заявление под присягой
    if (!createDmcaReportDto.isSwornStatement) {
      throw new HttpException('Sworn statement is required for DMCA reports', HttpStatus.BAD_REQUEST);
    }
    
    return this.dmcaReportService.create(createDmcaReportDto);
  }

  /**
   * Получение всех DMCA отчетов (только для администраторов и модераторов)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async findAll(): Promise<DmcaReport[]> {
    return this.dmcaReportService.findAll();
  }

  /**
   * Получение DMCA отчета по ID (только для администраторов и модераторов)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async findOne(@Param('id') id: string): Promise<DmcaReport> {
    const report = await this.dmcaReportService.findOne(id);
    if (!report) {
      throw new HttpException('DMCA report not found', HttpStatus.NOT_FOUND);
    }
    return report;
  }

  /**
   * Обновление статуса DMCA отчета (только для администраторов и модераторов)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  async update(
    @Param('id') id: string,
    @Body() updateDmcaReportDto: UpdateDmcaReportDto,
  ): Promise<DmcaReport> {
    const report = await this.dmcaReportService.update(id, updateDmcaReportDto);
    if (!report) {
      throw new HttpException('DMCA report not found', HttpStatus.NOT_FOUND);
    }
    return report;
  }

  /**
   * Удаление DMCA отчета (только для администраторов)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    const report = await this.dmcaReportService.findOne(id);
    if (!report) {
      throw new HttpException('DMCA report not found', HttpStatus.NOT_FOUND);
    }
    await this.dmcaReportService.remove(id);
  }
}
