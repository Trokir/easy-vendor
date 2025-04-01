import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/entities/user.entity';
import { Vendor } from '../src/entities/vendor.entity';
import { LegalConsent } from '../src/entities/legal-consent.entity';
import { JwtService } from '@nestjs/jwt';

describe('LegalConsentController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let testToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            entities: [User, Vendor, LegalConsent],
            synchronize: true,
            dropSchema: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Create test user and generate token
    const testUser = {
      id: 1,
      email: 'test@example.com',
    };
    testToken = jwtService.sign(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/legal-consent/record (POST)', () => {
    it('should record consent with valid token', () => {
      return request(app.getHttpServer())
        .post('/legal-consent/record')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: 1,
          type: 'terms',
          version: '1.0',
          metadata: { browser: 'Chrome' },
        })
        .expect(201);
    });

    it('should not record consent without token', () => {
      return request(app.getHttpServer())
        .post('/legal-consent/record')
        .send({
          userId: 1,
          type: 'terms',
          version: '1.0',
          metadata: { browser: 'Chrome' },
        })
        .expect(401);
    });
  });

  describe('/legal-consent/status (GET)', () => {
    it('should get consent status with valid token', () => {
      return request(app.getHttpServer())
        .get('/legal-consent/status')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          userId: 1,
          type: 'terms',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('isValid');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('acceptedAt');
          expect(res.body).toHaveProperty('expiresAt');
          expect(res.body).toHaveProperty('ip');
        });
    });

    it('should not get consent status without token', () => {
      return request(app.getHttpServer())
        .get('/legal-consent/status')
        .query({
          userId: 1,
          type: 'terms',
        })
        .expect(401);
    });
  });

  describe('/legal-consent/history/:userId (GET)', () => {
    it('should get consent history with valid token', () => {
      return request(app.getHttpServer())
        .get('/legal-consent/history/1')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('type');
            expect(res.body[0]).toHaveProperty('version');
            expect(res.body[0]).toHaveProperty('acceptedAt');
            expect(res.body[0]).toHaveProperty('ip');
            expect(res.body[0]).toHaveProperty('metadata');
          }
        });
    });

    it('should get filtered consent history with type', () => {
      return request(app.getHttpServer())
        .get('/legal-consent/history/1')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ type: 'terms' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0].type).toBe('terms');
          }
        });
    });

    it('should not get consent history without token', () => {
      return request(app.getHttpServer())
        .get('/legal-consent/history/1')
        .expect(401);
    });
  });
}); 