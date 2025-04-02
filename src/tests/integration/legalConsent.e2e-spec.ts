import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { LegalConsentService } from '../../services/legal-consent/legal-consent.service';
import { ConsentType } from '../../types/legal-consent';

describe('LegalConsentController (e2e)', () => {
  let app: INestApplication;
  let service: LegalConsentService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<LegalConsentService>(LegalConsentService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /legal-consent/record', () => {
    it('should record consent', async () => {
      const response = await request(app.getHttpServer())
        .post('/legal-consent/record')
        .send({
          userId: '1',
          consentType: ConsentType.TERMS_OF_SERVICE,
          version: '1.0',
          metadata: {
            ip: '127.0.0.1',
            userAgent: 'test-agent',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.consentType).toBe(ConsentType.TERMS_OF_SERVICE);
    });

    it('should return 400 for invalid consent type', async () => {
      const response = await request(app.getHttpServer())
        .post('/legal-consent/record')
        .send({
          userId: '1',
          consentType: 'invalid-type',
          version: '1.0',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /legal-consent/history/:userId', () => {
    it('should return consent history', async () => {
      // First record some consents
      await service.recordConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0', {
        ip: '127.0.0.1',
        timestamp: Date.now(),
      });
      await service.recordConsent(1, ConsentType.PRIVACY_POLICY, '1.0', {
        ip: '127.0.0.1',
        timestamp: Date.now(),
      });

      const response = await request(app.getHttpServer())
        .get('/legal-consent/history/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('consentType');
      expect(response.body[0]).toHaveProperty('version');
    });

    it('should return 401 for unauthorized access', async () => {
      return request(app.getHttpServer())
        .get('/legal-consent/history/1')
        .expect(401);
    });
  });
});
