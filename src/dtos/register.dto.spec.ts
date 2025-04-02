import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should validate valid data', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';
    dto.domain = 'test.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new RegisterDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail with short password', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'short';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail with password containing only numbers', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = '12345678';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints.matches).toBe('Password must contain at least one letter and one number');
  });

  it('should fail with password containing only letters', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints.matches).toBe('Password must contain at least one letter and one number');
  });

  it('should fail with missing required fields', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map(e => e.property)).toContain('password');
    expect(errors.map(e => e.property)).toContain('acceptedTerms');
    expect(errors.map(e => e.property)).toContain('businessName');
  });

  it('should validate with optional domain', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with empty email', async () => {
    const dto = new RegisterDto();
    dto.email = '';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail with empty business name', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('businessName');
  });

  it('should fail with invalid domain format', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';
    dto.domain = 'invalid domain';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('domain');
    expect(errors[0].constraints.matches).toBe('Invalid domain format');
  });

  it('should validate with valid domain format', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.acceptedTerms = true;
    dto.businessName = 'Test Business';
    dto.domain = 'valid-domain.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
}); 