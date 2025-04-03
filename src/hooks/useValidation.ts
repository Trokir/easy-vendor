import { useState, useCallback } from 'react';
import { ValidationService, ValidationResult, ValidationError } from '../services/validation.service';

export const useValidation = () => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((data: any, schema: any): ValidationResult => {
    const result = ValidationService.validate(data, schema);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, []);

  const validateTemplate = useCallback((content: any, template: any): ValidationResult => {
    const result = ValidationService.validateTemplate(content, template);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateTemplate,
    clearErrors,
  };
}; 