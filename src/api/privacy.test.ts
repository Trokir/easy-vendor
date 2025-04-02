import express from 'express';
import request from 'supertest';
import privacyRouter from './privacy';
import { GeoLocationService } from '../services/geoLocation.service';

// Mock GeoLocationService
jest.mock('../services/geoLocation.service', () => ({
  GeoLocationService: {
    isCaliforniaUser: jest.fn(),
  },
}));

describe('Privacy API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/privacy-settings', privacyRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/privacy-settings', () => {
    it('should return privacy settings and California user status', async () => {
      (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/privacy-settings')
        .expect(200);

      expect(response.body).toEqual({
        settings: {
          doNotSell: false,
          email: '',
          lastUpdated: expect.any(String),
        },
        isCaliforniaUser: true,
      });
    });

    it('should handle errors gracefully', async () => {
      (GeoLocationService.isCaliforniaUser as jest.Mock).mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/privacy-settings')
        .expect(500);

      expect(response.body).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred'
      });
      
      // Не проверяем наличие поля details, так как оно может быть undefined в production
    });
  });

  describe('PUT /api/privacy-settings', () => {
    it('should update privacy settings with valid email', async () => {
      const requestBody = {
        email: 'test@example.com',
        doNotSell: true,
      };

      const response = await request(app)
        .put('/api/privacy-settings')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        doNotSell: true,
        email: 'test@example.com',
        lastUpdated: expect.any(String),
      });
    });

    it('should reject invalid email', async () => {
      const requestBody = {
        email: 'invalid-email',
        doNotSell: true,
      };

      const response = await request(app)
        .put('/api/privacy-settings')
        .send(requestBody)
        .expect(400);

      expect(response.body).toEqual({
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
      });
    });
  });

  describe('POST /api/privacy-settings/ccpa-opt-out', () => {
    it('should process opt-out request for California users', async () => {
      (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(true);

      const requestBody = {
        email: 'test@example.com',
        doNotSell: true,
      };

      const response = await request(app)
        .post('/api/privacy-settings/ccpa-opt-out')
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Successfully opted out of data sales',
        timestamp: expect.any(String),
      });
    });

    it('should reject opt-out request for non-California users', async () => {
      (GeoLocationService.isCaliforniaUser as jest.Mock).mockResolvedValue(false);

      const requestBody = {
        email: 'test@example.com',
        doNotSell: true,
      };

      const response = await request(app)
        .post('/api/privacy-settings/ccpa-opt-out')
        .send(requestBody)
        .expect(403);

      expect(response.body).toEqual({
        code: 'NOT_CALIFORNIA_USER',
        message: 'CCPA opt-out is only available for California residents',
      });
    });

    it('should reject invalid email in opt-out request', async () => {
      const requestBody = {
        email: 'invalid-email',
        doNotSell: true,
      };

      const response = await request(app)
        .post('/api/privacy-settings/ccpa-opt-out')
        .send(requestBody)
        .expect(400);

      expect(response.body).toEqual({
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
      });
    });
  });
}); 