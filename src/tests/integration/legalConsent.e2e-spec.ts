import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { LegalConsentService } from '../../services/legalConsent.service';

describe('LegalConsentController (e2e)', () => {
  let app: INestApplication;
  let legalConsentService: LegalConsentService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    legalConsentService = moduleFixture.get<LegalConsentService>(LegalConsentService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/legal/consent', () => {
    it('should record new consent', async () => {
      const userId = 'test-user-id';
      const consentData = {
        consentType: 'terms',
        version: '1.0',
      };

      const response = await request(app.getHttpServer())
        .post('/api/legal/consent')
        .set('Authorization', `Bearer ${userId}`)
        .send(consentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.consentType).toBe(consentData.consentType);
      expect(response.body.version).toBe(consentData.version);
      expect(response.body.userId).toBe(userId);
      expect(response.body.acceptedAt).toBeDefined();
    });

    it('should return 400 for invalid consent type', async () => {
      const userId = 'test-user-id';
      const consentData = {
        consentType: 'invalid-type',
        version: '1.0',
      };

      await request(app.getHttpServer())
        .post('/api/legal/consent')
        .set('Authorization', `Bearer ${userId}`)
        .send(consentData)
        .expect(400);
    });
  });

  describe('GET /api/legal/consent/status', () => {
    it('should return consent status', async () => {
      const userId = 'test-user-id';

      // First, record a consent
      await legalConsentService.recordConsent(userId, 'terms', '1.0');

      const response = await request(app.getHttpServer())
        .get('/api/legal/consent/status')
        .set('Authorization', `Bearer ${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('hasValidConsent', true);
    });

    it('should return false for non-existent consent', async () => {
      const userId = 'non-existent-user';

      const response = await request(app.getHttpServer())
        .get('/api/legal/consent/status')
        .set('Authorization', `Bearer ${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('hasValidConsent', false);
    });
  });

  describe('GET /api/legal/consent/history', () => {
    it('should return consent history', async () => {
      const userId = 'test-user-id';

      // Record multiple consents
      await legalConsentService.recordConsent(userId, 'terms', '1.0');
      await legalConsentService.recordConsent(userId, 'privacy', '1.0');

      const response = await request(app.getHttpServer())
        .get('/api/legal/consent/history')
        .set('Authorization', `Bearer ${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('consentType');
      expect(response.body[0]).toHaveProperty('version');
      expect(response.body[0]).toHaveProperty('acceptedAt');
    });
  });
}); 