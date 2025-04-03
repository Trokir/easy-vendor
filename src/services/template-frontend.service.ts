import { Template, TemplateVersion } from '../types/template';

export class TemplateFrontendService {
  private static instance: TemplateFrontendService;
  private baseUrl: string = '/api/templates';

  private constructor() {}

  public static getInstance(): TemplateFrontendService {
    if (!TemplateFrontendService.instance) {
      TemplateFrontendService.instance = new TemplateFrontendService();
    }
    return TemplateFrontendService.instance;
  }

  async getTemplates(): Promise<Template[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  }

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }

  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    const response = await fetch(`${this.baseUrl}/${templateId}/versions`);
    if (!response.ok) {
      throw new Error('Failed to fetch template versions');
    }
    return response.json();
  }

  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'versions'>): Promise<Template> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error('Failed to create template');
    }
    return response.json();
  }

  async updateTemplate(templateId: string, template: Partial<Template>): Promise<Template> {
    const response = await fetch(`${this.baseUrl}/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error('Failed to update template');
    }
    return response.json();
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${templateId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  }

  async createTemplateVersion(templateId: string, version: Omit<TemplateVersion, 'id' | 'createdAt' | 'template'>): Promise<TemplateVersion> {
    const response = await fetch(`${this.baseUrl}/${templateId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(version),
    });
    if (!response.ok) {
      throw new Error('Failed to create template version');
    }
    return response.json();
  }
} 