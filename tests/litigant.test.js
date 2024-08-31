const request = require('supertest');
const app = require('../app'); // Assume your Express app is exported from app.js

describe('Litigant API', () => {
  let token;

  beforeAll(async () => {
    // You may need to seed data or get a JWT token here
    const res = await request(app)
      .post('/api/authenticate')
      .send({
        litigant_email: 'john.doe@example.com',
        litigant_password: 'password123'
      });
    token = res.body.token;
  });

  afterAll(async () => {
    await server.close(); // Close the server
  });


  it('should sign up a new litigant', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        litigant_name: 'Jane Doe',
        litigant_email: 'jane.doe@example.com',
        litigant_password: 'password123',
        confirm_password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('litigant');
  });

  it('should return all litigants', async () => {
    const res = await request(app)
      .get('/api/litigants')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should authenticate a litigant and return a token', async () => {
    const res = await request(app)
      .post('/api/authenticate')
      .send({
        litigant_email: 'john.doe@example.com',
        litigant_password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should complete profile', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        litigant_state: 'State1',
        litigant_district: 'District1',
        litigant_profile: 'New Profile'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.litigant).toHaveProperty('litigant_state', 'State1');
  });

  // Add more tests as needed
});
