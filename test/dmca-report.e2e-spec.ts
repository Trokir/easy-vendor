import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { testDbConfig } from './test-db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../src/auth/auth.service';
import { DmcaReport } from '../src/entities/dmca-report.entity';
import { User } from '../src/entities/user.entity';
import { Vendor } from '../src/entities/vendor.entity';
import { LegalConsent } from '../src/entities/legal-consent.entity';
import { Response } from 'supertest';

describe('DmcaReportController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userToken: string;
  let adminToken: string;
  let reportId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testDbConfig), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();

    // Register and login a regular user
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });

    const userLogin = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    userToken = userLogin.body.accessToken;

    // Register and login an admin
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const adminLogin = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.accessToken;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /dmca-reports', () => {
    it('should create a new DMCA report', async () => {
      const response = await request(app.getHttpServer())
        .post('/dmca-reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contentUrl: 'http://example.com/content',
          description: 'Copyright violation',
          reporterName: 'John Doe',
          reporterEmail: 'john@example.com',
          copyrightOwner: 'Copyright Owner LLC',
        })
        .expect(201);

      reportId = response.body.id;
    });

    it('should not create a report without authentication', () => {
      return request(app.getHttpServer())
        .post('/dmca-reports')
        .send({
          contentUrl: 'http://example.com/content',
          description: 'Copyright violation',
          reporterName: 'John Doe',
          reporterEmail: 'john@example.com',
          copyrightOwner: 'Copyright Owner LLC',
        })
        .expect(401);
    });
  });

  describe('GET /dmca-reports', () => {
    it('should allow admin to get all reports', async () => {
      await request(app.getHttpServer())
        .get('/dmca-reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    it('should not allow regular user to get all reports', async () => {
      await request(app.getHttpServer())
        .get('/dmca-reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /dmca-reports/:id', () => {
    it('should allow admin to get specific report', async () => {
      await request(app.getHttpServer())
        .get(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow regular user to get specific report', async () => {
      await request(app.getHttpServer())
        .get(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /dmca-reports/:id', () => {
    it('should allow admin to update report', async () => {
      await request(app.getHttpServer())
        .patch(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REVIEWED',
          adminNotes: 'Report reviewed and action taken',
        })
        .expect(200);
    });

    it('should not allow regular user to update report', async () => {
      await request(app.getHttpServer())
        .patch(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'REVIEWED',
          adminNotes: 'Report reviewed and action taken',
        })
        .expect(403);
    });
  });

  describe('DELETE /dmca-reports/:id', () => {
    it('should allow admin to delete report', async () => {
      await request(app.getHttpServer())
        .delete(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not allow regular user to delete report', async () => {
      await request(app.getHttpServer())
        .delete(`/dmca-reports/${reportId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
