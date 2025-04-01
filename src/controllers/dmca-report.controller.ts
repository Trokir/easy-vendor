import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DmcaReportService } from '../services/dmca-report.service';
import { CreateDmcaReportDto, UpdateDmcaReportDto } from '../dto/dmca-report.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('dmca-reports')
export class DmcaReportController {
  constructor(private readonly dmcaReportService: DmcaReportService) {}

  @Post()
  create(@Body() createDmcaReportDto: CreateDmcaReportDto) {
    return this.dmcaReportService.create(createDmcaReportDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.dmcaReportService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.dmcaReportService.findOne(id);
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  process(
    @Param('id') id: string,
    @Body() updateDmcaReportDto: UpdateDmcaReportDto,
  ) {
    return this.dmcaReportService.process(id, updateDmcaReportDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.dmcaReportService.remove(id);
  }
} 