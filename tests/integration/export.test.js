const request = require('supertest');
const app = require('../../server');
const { createTestUser, createTestDocument, cleanDatabase, generateAuthToken } = require('../unit/testHelpers');
const { Invoice, Receipt } = require('../../src/models');

describe('Export Endpoints Integration Tests', () => {
  let authToken;
  let userId;
  let invoiceId;
  let receiptId;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await createTestUser();
    authToken = generateAuthToken(user);
    userId = user.id;

    // Create test document
    const document = await createTestDocument(userId, 'invoice');

    // Create test invoice
    const invoice = await Invoice.create({
      document_id: document.id,
      user_id: userId,
      invoice_number: 'INV-2024-001',
      vendor_name: 'Test Vendor Inc.',
      invoice_date: new Date('2024-01-15'),
      due_date: new Date('2024-02-15'),
      total_amount: 1500.00,
      currency: 'USD',
      tax_amount: 150.00,
      subtotal: 1350.00,
      status: 'pending',
      payment_terms: 'Net 30',
      line_items: [
        { description: 'Service A', quantity: 2, unit_price: 500, total: 1000 },
        { description: 'Service B', quantity: 1, unit_price: 350, total: 350 }
      ]
    });
    invoiceId = invoice.id;

    // Create test receipt
    const receiptDoc = await createTestDocument(userId, 'receipt');
    const receipt = await Receipt.create({
      document_id: receiptDoc.id,
      user_id: userId,
      merchant_name: 'Test Store',
      purchase_date: new Date('2024-01-20'),
      total_amount: 250.00,
      currency: 'USD',
      tax_amount: 25.00,
      subtotal: 225.00,
      expense_category: 'office_supplies',
      payment_method: 'credit_card',
      is_business_expense: true,
      notes: 'Office supplies for Q1',
      items: [
        { description: 'Paper', quantity: 5, unit_price: 30, total: 150 },
        { description: 'Pens', quantity: 3, unit_price: 25, total: 75 }
      ]
    });
    receiptId = receipt.id;
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('Invoice Export Endpoints', () => {
    describe('GET /api/invoices/export/csv', () => {
      it('should export invoices as CSV', async () => {
        const response = await request(app)
          .get('/api/invoices/export/csv')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('invoices_');
        expect(response.text).toContain('Invoice Number');
        expect(response.text).toContain('INV-2024-001');
        expect(response.text).toContain('Test Vendor Inc.');
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/invoices/export/csv')
          .expect(401);
      });

      it('should return 404 when no invoices found', async () => {
        // Create a new user with no invoices
        const newUser = await createTestUser({ email: 'newuser@test.com' });
        const token = generateAuthToken(newUser);
        
        const response = await request(app)
          .get('/api/invoices/export/csv')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_DATA');
      });

      it('should support filtering by status', async () => {
        const response = await request(app)
          .get('/api/invoices/export/csv?status=pending')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.text).toContain('INV-2024-001');
      });
    });

    describe('GET /api/invoices/:id/export/pdf', () => {
      it('should export single invoice as PDF', async () => {
        const response = await request(app)
          .get(`/api/invoices/${invoiceId}/export/pdf`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('invoice_');
        expect(response.body).toBeInstanceOf(Buffer);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should require authentication', async () => {
        await request(app)
          .get(`/api/invoices/${invoiceId}/export/pdf`)
          .expect(401);
      });

      it('should return 404 for non-existent invoice', async () => {
        const response = await request(app)
          .get('/api/invoices/00000000-0000-0000-0000-000000000000/export/pdf')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('should not allow access to other users invoices', async () => {
        const otherUser = await createTestUser({ email: 'otheruser@test.com' });
        const token = generateAuthToken(otherUser);
        
        await request(app)
          .get(`/api/invoices/${invoiceId}/export/pdf`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });
  });

  describe('Receipt Export Endpoints', () => {
    describe('GET /api/receipts/export/csv', () => {
      it('should export receipts as CSV', async () => {
        const response = await request(app)
          .get('/api/receipts/export/csv')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('receipts_');
        expect(response.text).toContain('Merchant');
        expect(response.text).toContain('Test Store');
        expect(response.text).toContain('office_supplies');
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/receipts/export/csv')
          .expect(401);
      });

      it('should return 404 when no receipts found', async () => {
        const newUser = await createTestUser({ email: 'newuser2@test.com' });
        const token = generateAuthToken(newUser);
        
        const response = await request(app)
          .get('/api/receipts/export/csv')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_DATA');
      });

      it('should support filtering by category', async () => {
        const response = await request(app)
          .get('/api/receipts/export/csv?expense_category=office_supplies')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.text).toContain('Test Store');
      });

      it('should support filtering by business expense flag', async () => {
        const response = await request(app)
          .get('/api/receipts/export/csv?is_business_expense=true')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.text).toContain('Test Store');
      });
    });

    describe('GET /api/receipts/:id/export/pdf', () => {
      it('should export single receipt as PDF', async () => {
        const response = await request(app)
          .get(`/api/receipts/${receiptId}/export/pdf`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('receipt_');
        expect(response.body).toBeInstanceOf(Buffer);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should require authentication', async () => {
        await request(app)
          .get(`/api/receipts/${receiptId}/export/pdf`)
          .expect(401);
      });

      it('should return 404 for non-existent receipt', async () => {
        const response = await request(app)
          .get('/api/receipts/00000000-0000-0000-0000-000000000000/export/pdf')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('should not allow access to other users receipts', async () => {
        const otherUser = await createTestUser({ email: 'otheruser2@test.com' });
        const token = generateAuthToken(otherUser);
        
        await request(app)
          .get(`/api/receipts/${receiptId}/export/pdf`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });
  });
});
