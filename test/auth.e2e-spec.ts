import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const userEmail = 'user101@test.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: userEmail, password: '123456' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(userEmail).toEqual(email);
      });
  });

  it('signup as new user and get the currently loggedin user', async () => {
    const email = 'e2euser@test.com';
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '12345' })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
