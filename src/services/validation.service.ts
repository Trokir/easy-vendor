import { Template } from '../types/template';

export interface ValidationRule {
  name: string;
  validate: (value: any, context?: any) => boolean;
  message: string | ((context: any) => string);
}

export interface ValidationError {
  field: string;
  message: string;
  rule: string;
  value: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationService {
  private static instance: ValidationService;
  private customRules: Map<string, ValidationRule> = new Map();

  private constructor() {
    this.registerDefaultRules();
  }

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  private registerDefaultRules(): void {
    // Required field validation
    this.registerRule({
      name: 'required',
      validate: (value: any) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      },
      message: 'This field is required',
    });

    // String length validation
    this.registerRule({
      name: 'minLength',
      validate: (value: any, context: { min: number }) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        return String(value).length >= context.min;
      },
      message: (context: { min: number }) => `Must be at least ${context.min} characters`,
    });

    this.registerRule({
      name: 'maxLength',
      validate: (value: any, context: { max: number }) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        return String(value).length <= context.max;
      },
      message: (context: { max: number }) => `Must be no more than ${context.max} characters`,
    });

    // Number validation
    this.registerRule({
      name: 'min',
      validate: (value: any, context: { min: number }) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        const num = Number(value);
        return !isNaN(num) && num >= context.min;
      },
      message: (context: { min: number }) => `Must be at least ${context.min}`,
    });

    this.registerRule({
      name: 'max',
      validate: (value: any, context: { max: number }) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        const num = Number(value);
        return !isNaN(num) && num <= context.max;
      },
      message: (context: { max: number }) => `Must be no more than ${context.max}`,
    });

    // Pattern validation
    this.registerRule({
      name: 'pattern',
      validate: (value: any, context: { pattern: RegExp }) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        return context.pattern.test(String(value));
      },
      message: (context: { pattern: RegExp }) => `Must match pattern ${context.pattern}`,
    });

    // URL validation
    this.registerRule({
      name: 'url',
      validate: (value: any) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        try {
          new URL(String(value));
          return true;
        } catch {
          return false;
        }
      },
      message: 'Must be a valid URL',
    });

    // Email validation
    this.registerRule({
      name: 'email',
      validate: (value: any) => {
        if (!value) return true; // Skip if empty (use required rule for that)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(String(value));
      },
      message: 'Must be a valid email address',
    });
  }

  public registerRule(rule: ValidationRule): void {
    this.customRules.set(rule.name, rule);
  }

  public validateSchema(data: any, schema: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = this.getNestedValue(data, field);
      
      for (const rule of rules) {
        const ruleName = typeof rule === 'string' ? rule : rule.name;
        const ruleContext = typeof rule === 'string' ? {} : rule.context || {};
        
        const validationRule = this.customRules.get(ruleName);
        if (!validationRule) {
          console.warn(`Validation rule "${ruleName}" not found`);
          continue;
        }
        
        const isValid = validationRule.validate(value, ruleContext);
        if (!isValid) {
          const message = typeof validationRule.message === 'function' 
            ? validationRule.message(ruleContext) 
            : validationRule.message;
            
          errors.push({
            field,
            message,
            rule: ruleName,
            value,
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public validateTemplateContent(content: any, template: Template): ValidationResult {
    if (!template.structure) {
      return { isValid: true, errors: [] };
    }
    
    const schema = this.buildSchemaFromTemplate(template);
    return this.validateSchema(content, schema);
  }

  private buildSchemaFromTemplate(template: Template): Record<string, any> {
    const schema: Record<string, any> = {};
    
    if (!template.structure || typeof template.structure !== 'object') {
      return schema;
    }
    
    const processField = (field: string, fieldDef: any, prefix: string = '') => {
      const fullPath = prefix ? `${prefix}.${field}` : field;
      
      if (fieldDef.type === 'object' && fieldDef.properties) {
        for (const [propName, propDef] of Object.entries(fieldDef.properties)) {
          processField(propName, propDef, fullPath);
        }
      } else {
        const rules: any[] = [];
        
        // Add required rule if field is required
        if (fieldDef.required) {
          rules.push('required');
        }
        
        // Add type-specific rules
        if (fieldDef.type === 'string') {
          if (fieldDef.minLength) {
            rules.push({ name: 'minLength', context: { min: fieldDef.minLength } });
          }
          if (fieldDef.maxLength) {
            rules.push({ name: 'maxLength', context: { max: fieldDef.maxLength } });
          }
          if (fieldDef.pattern) {
            rules.push({ name: 'pattern', context: { pattern: new RegExp(fieldDef.pattern) } });
          }
          if (fieldDef.format === 'email') {
            rules.push('email');
          }
          if (fieldDef.format === 'uri') {
            rules.push('url');
          }
        } else if (fieldDef.type === 'number' || fieldDef.type === 'integer') {
          if (fieldDef.minimum !== undefined) {
            rules.push({ name: 'min', context: { min: fieldDef.minimum } });
          }
          if (fieldDef.maximum !== undefined) {
            rules.push({ name: 'max', context: { max: fieldDef.maximum } });
          }
        }
        
        // Add custom validation rules if specified
        if (fieldDef.validation) {
          for (const [ruleName, ruleContext] of Object.entries(fieldDef.validation)) {
            rules.push({ name: ruleName, context: ruleContext });
          }
        }
        
        schema[fullPath] = rules;
      }
    };
    
    for (const [field, fieldDef] of Object.entries(template.structure)) {
      processField(field, fieldDef);
    }
    
    return schema;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, part) => {
      return current && current[part] !== undefined ? current[part] : undefined;
    }, obj);
  }
} 