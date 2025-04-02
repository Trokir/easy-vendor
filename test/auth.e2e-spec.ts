import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/entities/user.entity';
import { Vendor } from '../src/entities/vendor.entity';
import { LegalConsent } from '../src/entities/legal-consent.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          termsAccepted: true,
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should not register user without accepting terms', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'password123',
          termsAccepted: false,
        })
        .expect(400);
    });

    it('should not register user with existing email', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test3@example.com',
        password: 'password123',
        termsAccepted: true,
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test3@example.com',
          password: 'password123',
          termsAccepted: true,
        })
        .expect(409);
    });
  });
});
