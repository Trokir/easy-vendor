import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentVersion } from '../entities/content.entity';
import { User } from '../entities/user.entity';

interface VersionQueryOptions {
  page?: number;
  limit?: number;
  type?: string;
  sort?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(ContentVersion)
    private versionRepository: Repository<ContentVersion>,
  ) {}

  async createContent(content: Partial<Content>): Promise<Content> {
    const newContent = this.contentRepository.create(content);
    const savedContent = await this.contentRepository.save(newContent);
    
    // Create initial version
    await this.createVersion(savedContent.id, {
      body: savedContent.body,
      metadata: savedContent.metadata,
      templateId: savedContent.templateId,
      versionType: 'manual',
      authorId: savedContent.authorId,
    });

    return savedContent;
  }

  async updateContent(id: string, data: Partial<Content>): Promise<Content> {
    const existingContent = await this.getContent(id);
    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    const updatedContent = this.contentRepository.merge(existingContent, data);
    const savedContent = await this.contentRepository.save(updatedContent);

    // Create new version
    await this.createVersion(id, {
      body: savedContent.body,
      metadata: savedContent.metadata,
      templateId: savedContent.templateId,
      versionType: 'manual',
      authorId: savedContent.authorId,
    });

    return savedContent;
  }

  async autoSaveContent(id: string, data: Partial<Content>): Promise<Content> {
    const existingContent = await this.getContent(id);
    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    const updatedContent = this.contentRepository.merge(existingContent, data);
    const savedContent = await this.contentRepository.save(updatedContent);

    // Create auto-save version
    await this.createVersion(id, {
      body: savedContent.body,
      metadata: savedContent.metadata,
      templateId: savedContent.templateId,
      versionType: 'auto',
      authorId: savedContent.authorId,
    });

    return savedContent;
  }

  async getContent(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async getContentVersions(
    id: string,
    options: VersionQueryOptions = {},
  ): Promise<{ items: ContentVersion[]; total: number }> {
    const { page = 1, limit = 20, type, sort = 'DESC', search } = options;

    const queryBuilder = this.versionRepository
      .createQueryBuilder('version')
      .where('version.contentId = :id', { id });

    if (type && type !== 'all') {
      queryBuilder.andWhere('version.versionType = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere('version.metadata::text ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await queryBuilder
      .orderBy('version.createdAt', sort)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async deleteContent(id: string): Promise<void> {
    const content = await this.getContent(id);
    await this.contentRepository.remove(content);
  }

  async publishContent(id: string): Promise<Content> {
    const content = await this.getContent(id);
    const publishedContent = this.contentRepository.merge(content, { isPublished: true });
    const savedContent = await this.contentRepository.save(publishedContent);

    // Create publish version
    await this.createVersion(id, {
      body: savedContent.body,
      metadata: savedContent.metadata,
      templateId: savedContent.templateId,
      versionType: 'publish',
      authorId: savedContent.authorId,
    });

    return savedContent;
  }

  async unpublishContent(id: string): Promise<Content> {
    const content = await this.getContent(id);
    const unpublishedContent = this.contentRepository.merge(content, { isPublished: false });
    return this.contentRepository.save(unpublishedContent);
  }

  async bulkDeleteVersions(id: string, versionIds: string[]): Promise<void> {
    await this.versionRepository
      .createQueryBuilder()
      .delete()
      .where('contentId = :id AND id IN (:...versionIds)', { id, versionIds })
      .execute();
  }

  async bulkRestoreVersions(id: string, versionIds: string[]): Promise<void> {
    const versions = await this.versionRepository
      .createQueryBuilder('version')
      .where('contentId = :id AND id IN (:...versionIds)', { id, versionIds })
      .getMany();

    for (const version of versions) {
      await this.restoreVersion(id, version.id);
    }
  }

  async getVersion(id: string, versionId: string): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId, contentId: id },
    });

    if (!version) {
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    }

    return version;
  }

  async restoreVersion(id: string, versionId: string): Promise<ContentVersion> {
    const version = await this.getVersion(id, versionId);
    const content = await this.getContent(id);

    // Update content with version data
    const restoredContent = this.contentRepository.merge(content, {
      body: version.body,
      metadata: version.metadata,
      templateId: version.templateId,
    });
    await this.contentRepository.save(restoredContent);

    // Create new version from restored content
    return this.createVersion(id, {
      body: version.body,
      metadata: version.metadata,
      templateId: version.templateId,
      versionType: 'manual',
      authorId: content.authorId,
    });
  }

  async deleteVersion(id: string, versionId: string): Promise<void> {
    const version = await this.getVersion(id, versionId);
    await this.versionRepository.remove(version);
  }

  private async createVersion(
    contentId: string,
    data: {
      body: string;
      metadata?: Record<string, any>;
      templateId?: string;
      versionType: string;
      authorId: string;
    },
  ): Promise<ContentVersion> {
    const version = this.versionRepository.create({
      contentId,
      body: data.body,
      metadata: data.metadata,
      templateId: data.templateId,
      versionType: data.versionType,
      authorId: data.authorId,
    });

    return this.versionRepository.save(version);
  }
} 