import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { AppModule } from '../src/app.module';

describe('haill MVP API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns health status', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.ok).toBe(true);
  });

  it('creates a farmer supply with self delivery and pickup prices pending review', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/supplies')
      .send({ farmerId: 2, productName: '黄桃', category: '水果', quantity: 1000, unit: '斤', region: '安徽砀山', selfDeliveryPrice: 3.2, pickupPrice: 2.8, videoUrl: 'https://example.com/video.mp4' })
      .expect(201);

    expect(res.body.status).toBe('pending');
    expect(res.body.selfDeliveryPrice).toBe(3.2);
    expect(res.body.pickupPrice).toBe(2.8);
  });

  it('lets a teacher answer a farmer question', async () => {
    const question = await request(app.getHttpServer())
      .post('/api/questions')
      .send({ farmerId: 2, title: '辣椒叶子卷起来', description: '叶片发卷发黄', category: '种植', cropOrBreed: '辣椒', region: '河南' })
      .expect(201);

    const answer = await request(app.getHttpServer())
      .post(`/api/questions/${question.body.id}/answers`)
      .send({ teacherId: 3, content: '先检查蚜虫和蓟马，再观察是否缺水或药害。' })
      .expect(201);

    expect(answer.body.questionId).toBe(question.body.id);
  });

  it('approves a pending purchase demand through admin review', async () => {
    const demand = await request(app.getHttpServer())
      .post('/api/purchase-demands')
      .send({ buyerId: 4, productName: '土鸡', category: '养殖', quantity: 500, unit: '只', region: '50公里内', selfDeliveryPrice: 18, pickupPrice: 16 })
      .expect(201);

    const reviewed = await request(app.getHttpServer())
      .post(`/api/admin/review/purchaseDemand/${demand.body.id}`)
      .send({ action: 'approved' })
      .expect(201);

    expect(reviewed.body.status).toBe('approved');
  });
});
