export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  structure: Record<string, any>;
  defaultValues?: Record<string, any>;
  metadata?: Record<string, any>;
  category: string;
  isPublic: boolean;
  author: User;
  versions: TemplateVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVersion {
  id: string;
  versionNumber: number;
  structure: Record<string, any>;
  defaultValues?: Record<string, any>;
  metadata?: Record<string, any>;
  category: string;
  template: Template;
  author: User;
  versionType: string;
  comment?: string;
  createdAt: Date;
} 