const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const { query } = require('../../utils/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      // Mock database responses
      query.mockResolvedValueOnce({ rows: [] }); // Check existing user
      query.mockResolvedValueOnce({ rows: [{ id: 1, email: validUser.email }] }); // Create user

      // Mock bcrypt
      bcrypt.genSalt.mockResolvedValueOnce('salt');
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      // Mock JWT
      jwt.sign.mockReturnValueOnce('test-token');

      const response = await request(app).post('/api/auth/register').send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.token).toBe('test-token');
    });

    it('should return 400 for existing email', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // User exists

      const response = await request(app).post('/api/auth/register').send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should validate email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      // Mock database response
      query.mockResolvedValueOnce({
        rows: [{ id: 1, email: validCredentials.email, password_hash: 'hashedPassword' }],
      });

      // Mock bcrypt
      bcrypt.compare.mockResolvedValueOnce(true);

      // Mock JWT
      jwt.sign.mockReturnValueOnce('test-token');

      const response = await request(app).post('/api/auth/login').send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(validCredentials.email);
      expect(response.body.token).toBe('test-token');
    });

    it('should return 401 for invalid credentials', async () => {
      query.mockResolvedValueOnce({
        rows: [{ id: 1, email: validCredentials.email, password_hash: 'hashedPassword' }],
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app).post('/api/auth/login').send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data for authenticated request', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      // Mock JWT verification
      jwt.verify.mockReturnValueOnce({ id: mockUser.id });

      // Mock database response
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Please authenticate');
    });
  });
});
