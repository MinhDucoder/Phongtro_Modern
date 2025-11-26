import request from 'supertest';
import app from '../server.js';

describe('Landlord Stats endpoints', () => {
  it('requires auth for /overview', async () => {
    const res = await request(app)
      .get('/api/v1/landlord/stats/overview')
      .expect(401);
    expect(res.body).toBeDefined();
  });

  it('requires auth for /posts', async () => {
    const res = await request(app)
      .get('/api/v1/landlord/stats/posts')
      .expect(401);
    expect(res.body).toBeDefined();
  });

  it('requires auth for /post/:id/timeseries', async () => {
    const res = await request(app)
      .get('/api/v1/landlord/stats/post/651234567890123456789012/timeseries')
      .expect(401);
    expect(res.body).toBeDefined();
  });
});




















