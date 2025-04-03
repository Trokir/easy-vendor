import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ContentService } from '../../services/content.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Content, ContentVersion } from '../../entities/content.entity';
import { User } from '../../decorators/user.decorator';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async createContent(@Body() content: Partial<Content>, @User('id') authorId: string): Promise<Content> {
    return this.contentService.createContent({ ...content, authorId });
  }

  @Put(':id')
  async updateContent(
    @Param('id') id: string,
    @Body() content: Partial<Content>,
  ): Promise<Content> {
    return this.contentService.updateContent(id, content);
  }

  @Post(':id/auto-save')
  async autoSaveContent(
    @Param('id') id: string,
    @Body() content: Partial<Content>,
  ): Promise<Content> {
    return this.contentService.autoSaveContent(id, content);
  }

  @Get(':id')
  async getContent(@Param('id') id: string): Promise<Content> {
    return this.contentService.getContent(id);
  }

  @Get(':id/versions')
  async getContentVersions(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('sort') sort?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ): Promise<{ items: ContentVersion[]; total: number }> {
    return this.contentService.getContentVersions(id, { page, limit, type, sort, search });
  }

  @Delete(':id')
  async deleteContent(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteContent(id);
  }

  @Post(':id/publish')
  async publishContent(@Param('id') id: string): Promise<Content> {
    return this.contentService.publishContent(id);
  }

  @Post(':id/unpublish')
  async unpublishContent(@Param('id') id: string): Promise<Content> {
    return this.contentService.unpublishContent(id);
  }

  @Post(':id/versions/bulk-delete')
  async bulkDeleteVersions(
    @Param('id') id: string,
    @Body('versionIds') versionIds: string[],
  ): Promise<void> {
    return this.contentService.bulkDeleteVersions(id, versionIds);
  }

  @Post(':id/versions/bulk-restore')
  async bulkRestoreVersions(
    @Param('id') id: string,
    @Body('versionIds') versionIds: string[],
  ): Promise<void> {
    return this.contentService.bulkRestoreVersions(id, versionIds);
  }

  @Get(':id/versions/:versionId')
  async getVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ): Promise<ContentVersion> {
    return this.contentService.getVersion(id, versionId);
  }

  @Post(':id/versions/:versionId/restore')
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ): Promise<ContentVersion> {
    return this.contentService.restoreVersion(id, versionId);
  }

  @Delete(':id/versions/:versionId')
  async deleteVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    return this.contentService.deleteVersion(id, versionId);
  }
} 