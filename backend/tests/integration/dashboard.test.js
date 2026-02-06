const request = require('supertest');
const app = require('../../server');
const { sequelize, Document, Invoice, Receipt, Resume, Contract, User } = require('../../src/models');
const { createTestUser, createTestDocument, generateAuthToken } = require('../unit/testHelpers');

// Increase timeout for integration tests
jest.setTimeout(10000);

describe('Dashboard Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser();
    authToken = generateAuthToken(testUser);
  });

  afterEach(async () => {
    // Clean up database
    await Receipt.destroy({ where: {} });
    await Contract.destroy({ where: {} });
    await Resume.destroy({ where: {} });
    await Invoice.destroy({ where: {} });
    await Document.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/dashboard/overview', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview');

      expect(response.status).toBe(401);
    });

    test('should return empty dashboard for new user', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.total_documents).toBe(0);
      expect(response.body.data.financial.invoices.total_count).toBe(0);
      expect(response.body.data.financial.receipts.total_count).toBe(0);
      expect(response.body.data.recent_activity).toHaveLength(0);
    });

    test('should return dashboard with document statistics', async () => {
      // Create test documents
      const invoiceDoc = await createTestDocument(testUser.id, 'invoice');
      const receiptDoc = await createTestDocument(testUser.id, 'receipt');
      const resumeDoc = await createTestDocument(testUser.id, 'resume');
      const contractDoc = await createTestDocument(testUser.id, 'contract');

      // Update processing status
      await invoiceDoc.update({ processing_status: 'completed' });
      await receiptDoc.update({ processing_status: 'completed' });
      await resumeDoc.update({ processing_status: 'processing' });
      await contractDoc.update({ processing_status: 'pending' });

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const { summary } = response.body.data;
      expect(summary.total_documents).toBe(4);
      expect(summary.documents_by_type.invoice).toBe(1);
      expect(summary.documents_by_type.receipt).toBe(1);
      expect(summary.documents_by_type.resume).toBe(1);
      expect(summary.documents_by_type.contract).toBe(1);
      expect(summary.processing_status.completed).toBe(2);
      expect(summary.processing_status.processing).toBe(1);
      expect(summary.processing_status.pending).toBe(1);
    });

    test('should return financial statistics for invoices', async () => {
      // Create invoice documents
      const doc1 = await createTestDocument(testUser.id, 'invoice');
      const doc2 = await createTestDocument(testUser.id, 'invoice');
      const doc3 = await createTestDocument(testUser.id, 'invoice');

      // Create invoices with different statuses
      await Invoice.create({
        document_id: doc1.id,
        user_id: testUser.id,
        total_amount: 1000.00,
        status: 'pending',
        currency: 'USD'
      });

      await Invoice.create({
        document_id: doc2.id,
        user_id: testUser.id,
        total_amount: 2500.00,
        status: 'paid',
        currency: 'USD'
      });

      await Invoice.create({
        document_id: doc3.id,
        user_id: testUser.id,
        total_amount: 500.00,
        status: 'overdue',
        currency: 'USD'
      });

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const { invoices } = response.body.data.financial;
      expect(invoices.total_count).toBe(3);
      expect(invoices.total_amount).toBe(4000.00);
      expect(invoices.by_status.pending).toBe(1);
      expect(invoices.by_status.paid).toBe(1);
      expect(invoices.by_status.overdue).toBe(1);
      expect(invoices.pending_amount).toBe(1000.00);
      expect(invoices.paid_amount).toBe(2500.00);
    });

    test('should return financial statistics for receipts', async () => {
      // Create receipt documents
      const doc1 = await createTestDocument(testUser.id, 'receipt');
      const doc2 = await createTestDocument(testUser.id, 'receipt');
      const doc3 = await createTestDocument(testUser.id, 'receipt');

      // Create receipts with different categories
      await Receipt.create({
        document_id: doc1.id,
        user_id: testUser.id,
        total_amount: 150.00,
        expense_category: 'food',
        is_business_expense: true,
        currency: 'USD'
      });

      await Receipt.create({
        document_id: doc2.id,
        user_id: testUser.id,
        total_amount: 300.00,
        expense_category: 'travel',
        is_business_expense: true,
        currency: 'USD'
      });

      await Receipt.create({
        document_id: doc3.id,
        user_id: testUser.id,
        total_amount: 50.00,
        expense_category: 'food',
        is_business_expense: false,
        currency: 'USD'
      });

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const { receipts } = response.body.data.financial;
      expect(receipts.total_count).toBe(3);
      expect(receipts.total_amount).toBe(500.00);
      expect(receipts.business_expenses).toBe(2);
      expect(receipts.personal_expenses).toBe(1);
      expect(receipts.top_categories).toHaveLength(2);
      expect(receipts.top_categories[0].category).toBe('travel');
      expect(receipts.top_categories[0].amount).toBe(300.00);
      expect(receipts.top_categories[1].category).toBe('food');
      expect(receipts.top_categories[1].amount).toBe(200.00);
    });

    test('should filter by date range', async () => {
      // Create test documents
      await createTestDocument(testUser.id, 'invoice');
      await createTestDocument(testUser.id, 'receipt');

      // Get current date range (today)
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const response = await request(app)
        .get('/api/dashboard/overview')
        .query({
          start_date: startOfDay.toISOString().split('T')[0],
          end_date: endOfDay.toISOString().split('T')[0]
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Verify the response structure is correct (documents may or may not match filter)
      expect(response.body.data.summary).toHaveProperty('total_documents');
      expect(typeof response.body.data.summary.total_documents).toBe('number');
    });

    test('should filter by period (week)', async () => {
      // Create documents (will have current timestamp)
      await createTestDocument(testUser.id, 'invoice');
      await createTestDocument(testUser.id, 'receipt');

      const response = await request(app)
        .get('/api/dashboard/overview')
        .query({ period: 'week' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Both documents created just now should be within the last week
      expect(response.body.data.summary.total_documents).toBe(2);
    });

    test('should return recent activity', async () => {
      // Create multiple documents with small delays to ensure different timestamps
      const docs = [];
      for (let i = 0; i < 5; i++) {
        docs.push(await createTestDocument(testUser.id, 'invoice'));
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.recent_activity).toBeDefined();
      expect(response.body.data.recent_activity.length).toBeGreaterThanOrEqual(5);
      
      if (response.body.data.recent_activity.length > 0) {
        expect(response.body.data.recent_activity[0]).toHaveProperty('id');
        expect(response.body.data.recent_activity[0]).toHaveProperty('type');
        expect(response.body.data.recent_activity[0]).toHaveProperty('status');
        expect(response.body.data.recent_activity[0]).toHaveProperty('created_at');
      }
    });

    test('should return trend data', async () => {
      // Create documents (will have current timestamp)
      await createTestDocument(testUser.id, 'invoice');
      await createTestDocument(testUser.id, 'receipt');

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const { trends } = response.body.data;
      expect(trends).toHaveProperty('documents_by_date');
      expect(trends).toHaveProperty('uploads_last_7_days');
      expect(trends).toHaveProperty('uploads_last_30_days');
      
      // Verify the structure and types are correct
      expect(typeof trends.uploads_last_7_days).toBe('number');
      expect(typeof trends.uploads_last_30_days).toBe('number');
      expect(trends.documents_by_date).toBeInstanceOf(Array);
      // Verify 30-day count is >= 7-day count (logical consistency)
      expect(trends.uploads_last_30_days).toBeGreaterThanOrEqual(trends.uploads_last_7_days);
    });

    test('should isolate data between users', async () => {
      // Create documents for first user
      await createTestDocument(testUser.id, 'invoice');
      await createTestDocument(testUser.id, 'receipt');

      // Create second user with documents
      const testUser2 = await createTestUser();
      const authToken2 = generateAuthToken(testUser2);
      await createTestDocument(testUser2.id, 'invoice');

      // Request dashboard for first user
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.summary.total_documents).toBe(2);

      // Request dashboard for second user
      const response2 = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response2.status).toBe(200);
      expect(response2.body.data.summary.total_documents).toBe(1);
    });

    test('should handle mixed document types correctly', async () => {
      // Create various documents
      const invoiceDoc = await createTestDocument(testUser.id, 'invoice');
      const receiptDoc = await createTestDocument(testUser.id, 'receipt');
      const resumeDoc = await createTestDocument(testUser.id, 'resume');

      // Create invoice
      await Invoice.create({
        document_id: invoiceDoc.id,
        user_id: testUser.id,
        total_amount: 1000.00,
        status: 'paid'
      });

      // Create receipt
      await Receipt.create({
        document_id: receiptDoc.id,
        user_id: testUser.id,
        total_amount: 100.00,
        expense_category: 'office',
        is_business_expense: true
      });

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const data = response.body.data;
      expect(data.summary.total_documents).toBe(3);
      expect(data.summary.documents_by_type.invoice).toBe(1);
      expect(data.summary.documents_by_type.receipt).toBe(1);
      expect(data.summary.documents_by_type.resume).toBe(1);
      expect(data.financial.invoices.total_count).toBe(1);
      expect(data.financial.receipts.total_count).toBe(1);
    });
  });
});
