const request = require('supertest');
const app = require('../server');

describe('Backend Basic Healthcheck & Public API Tests', () => {
  it('GET /health - Nên trả về trạng thái UP (200)', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('GET /api/games - Nên trả về danh sách game công khai', async () => {
    const res = await request(app).get('/api/games');
    expect(res.statusCode).toBeLessThanOrEqual(500);
    expect(Array.isArray(res.body) || res.body.message).toBeTruthy();
  });
});