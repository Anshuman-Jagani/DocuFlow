const request = require('supertest');
const app = require('../../server');
const { JobPosting, User } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Job Posting Integration Tests', () => {
  let token;
  let user;

  beforeAll(async () => {
    // Create a test user
    user = await User.create({
      full_name: 'Test Job Admin',
      email: 'jobs@test.com',
      password_hash: 'password123' // The model hook will hash this? Let's assume yes or just use a dummy
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'testsecret');
  });

  afterAll(async () => {
    await JobPosting.destroy({ where: {} });
    await User.destroy({ where: { id: user.id } });
  });

  describe('POST /api/jobs', () => {
    it('should create a new job posting', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop awesome apps',
          required_skills: ['JavaScript', 'Node.js']
        });


      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Software Engineer');
    });
  });

  describe('GET /api/jobs', () => {
    it('should list all job postings', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
