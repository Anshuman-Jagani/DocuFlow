const request = require('supertest');
const app = require('../../server');
const { sequelize, Document, Invoice, Resume, Contract, Receipt, User } = require('../../src/models');
const { generateSignature, generateTimestamp } = require('../../src/utils/crypto');
const { createTestUser, createTestDocument } = require('../unit/testHelpers');

// Increase timeout for integration tests
jest.setTimeout(10000);

describe('Webhook Integration Tests', () => {
  let testUser;
  let webhookSecret;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  });

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser();
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

  /**
   * Helper function to make webhook request (Security Disabled)
   */
  const makeWebhookRequest = (endpoint, payload) => {
    return request(app)
      .post(`/api/webhooks/${endpoint}`)
      .send(payload);
  };

  describe('Webhook Security', () => {
    test('should accept request without any security headers', async () => {
      // Create test document first
      const document = await createTestDocument(testUser.id, 'invoice');

      const payload = {
        document_id: document.id,
        document_type: 'invoice',
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('document-uploaded', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/webhooks/document-uploaded', () => {
    test('should update document status to processing', async () => {
      const document = await createTestDocument(testUser.id, 'invoice');

      const payload = {
        document_id: document.id,
        document_type: 'invoice',
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('document-uploaded', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.processing_status).toBe('processing');

      // Verify database update
      const updatedDoc = await Document.findByPk(document.id);
      expect(updatedDoc.processing_status).toBe('processing');
    });

    test('should return 404 for non-existent document', async () => {
      const payload = {
        document_id: '00000000-0000-0000-0000-000000000000',
        document_type: 'invoice',
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('document-uploaded', payload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/webhooks/invoice-processed', () => {
    test('should update invoice with processed data', async () => {
      const document = await createTestDocument(testUser.id, 'invoice');
      const invoice = await Invoice.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          invoice_number: 'INV-2024-001',
          vendor_name: 'Test Vendor',
          total_amount: 1500.00,
          currency: 'USD',
          issue_date: '2024-01-15',
          due_date: '2024-02-15',
          status: 'pending',
          tax_amount: 150.00,
          line_items: [
            { description: 'Item 1', quantity: 2, unit_price: 500, total: 1000 },
            { description: 'Item 2', quantity: 1, unit_price: 500, total: 500 }
          ]
        },
        validation: {
          status: 'valid',
          confidence_score: 95,
          errors: []
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('invoice-processed', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.confidence_score).toBe(95);

      // Verify database update
      const updatedInvoice = await Invoice.findByPk(invoice.id);
      expect(updatedInvoice.invoice_date).toBe('2024-01-15');
      expect(updatedInvoice.vendor_name).toBe('Test Vendor');
      expect(updatedInvoice.total_amount).toBeDefined();
      expect(updatedInvoice.confidence_score).toBe(95);
      expect(updatedInvoice.line_items).toHaveLength(2);

      // Verify document status updated
      const updatedDoc = await Document.findByPk(document.id);
      expect(updatedDoc.processing_status).toBe('completed');
    });

    test('should handle validation errors', async () => {
      const document = await createTestDocument(testUser.id, 'invoice');
      const invoice = await Invoice.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          invoice_number: 'INV-2024-002',
          total_amount: 1000.00
        },
        validation: {
          status: 'needs_review',
          confidence_score: 65,
          errors: ['Missing vendor name', 'Unclear due date']
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('invoice-processed', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedInvoice = await Invoice.findByPk(invoice.id);
      expect(updatedInvoice.validation_errors).toHaveLength(2);

      const updatedDoc = await Document.findByPk(document.id);
      expect(updatedDoc.processing_status).toBe('needs_review');
    });
  });

  describe('POST /api/webhooks/resume-processed', () => {
    test('should update resume with extracted data', async () => {
      const document = await createTestDocument(testUser.id, 'resume');
      const resume = await Resume.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          candidate_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          location: 'San Francisco, CA',
          years_of_experience: 5,
          current_position: 'Senior Developer',
          summary: 'Experienced software developer',
          skills: ['JavaScript', 'Python', 'React', 'Node.js'],
          experience: [
            {
              company: 'Tech Corp',
              position: 'Senior Developer',
              duration: '2020-Present',
              description: 'Led development team'
            }
          ],
          education: [
            {
              degree: 'BS Computer Science',
              institution: 'University of Tech',
              year: '2018'
            }
          ]
        },
        validation: {
          status: 'valid',
          confidence_score: 92,
          errors: []
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('resume-processed', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedResume = await Resume.findByPk(resume.id);
      expect(updatedResume.candidate_name).toBe('John Doe');
      expect(updatedResume.email).toBe('john.doe@example.com');
      expect(updatedResume.total_years_experience.toString()).toBe("5.0");
      expect(updatedResume.professional_summary).toBe('Experienced software developer');
      expect(updatedResume.skills).toHaveLength(4);
      expect(updatedResume.experience).toHaveLength(1);
      expect(updatedResume.education).toHaveLength(1);
    });
  });

  describe('POST /api/webhooks/contract-analyzed', () => {
    test('should update contract with analysis results', async () => {
      const document = await createTestDocument(testUser.id, 'contract');
      const contract = await Contract.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          contract_title: 'Service Agreement',
          contract_type: 'service',
          contract_value: 50000.00,
          currency: 'USD',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          status: 'active',
          risk_score: 25,
          parties: [
            { name: 'Company A', role: 'Client' },
            { name: 'Company B', role: 'Service Provider' }
          ],
          payment_terms: {
            schedule: 'monthly',
            amount: 4166.67,
            due_day: 1
          },
          obligations: [
            'Deliver services as specified',
            'Maintain confidentiality'
          ],
          red_flags: []
        },
        validation: {
          status: 'valid',
          confidence_score: 88,
          errors: []
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('contract-analyzed', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.risk_score).toBe(25);

      const updatedContract = await Contract.findByPk(contract.id);
      expect(updatedContract.contract_title).toBe('Service Agreement');
      expect(updatedContract.effective_date).toBe('2024-01-01');
      expect(updatedContract.expiration_date).toBe('2024-12-31');
      expect(parseFloat(updatedContract.contract_value)).toBe(50000.00);
      expect(updatedContract.risk_score).toBe(25);
      expect(updatedContract.parties).toHaveLength(2);
      expect(updatedContract.red_flags).toHaveLength(0);
    });

    test('should handle high-risk contracts', async () => {
      const document = await createTestDocument(testUser.id, 'contract');
      const contract = await Contract.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          contract_title: 'High Risk Agreement',
          contract_type: 'service',
          risk_score: 85,
          red_flags: [
            'Unclear termination clause',
            'Unlimited liability',
            'No dispute resolution mechanism'
          ]
        },
        validation: {
          status: 'needs_review',
          confidence_score: 70,
          errors: []
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('contract-analyzed', payload);

      expect(response.status).toBe(200);
      const updatedContract = await Contract.findByPk(contract.id);
      expect(updatedContract.risk_score).toBe(85);
      expect(updatedContract.red_flags).toHaveLength(3);
    });
  });

  describe('POST /api/webhooks/receipt-processed', () => {
    test('should update receipt with processed data', async () => {
      const document = await createTestDocument(testUser.id, 'receipt');
      const receipt = await Receipt.create({
        document_id: document.id,
        user_id: testUser.id
      });

      const payload = {
        document_id: document.id,
        processed_data: {
          merchant_name: 'Office Supplies Inc',
          total_amount: 125.50,
          currency: 'USD',
          purchase_date: '2024-01-20',
          category: 'office_supplies',
          tax_amount: 10.50,
          payment_method: 'credit_card',
          is_business_expense: true,
          items: [
            { description: 'Printer Paper', quantity: 5, unit_price: 10, total: 50 },
            { description: 'Pens', quantity: 10, unit_price: 2.5, total: 25 },
            { description: 'Notebooks', quantity: 5, unit_price: 5, total: 25 }
          ]
        },
        validation: {
          status: 'valid',
          confidence_score: 90,
          errors: []
        },
        timestamp: new Date().toISOString()
      };

      const response = await makeWebhookRequest('receipt-processed', payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedReceipt = await Receipt.findByPk(receipt.id);
      expect(updatedReceipt.merchant_name).toBe('Office Supplies Inc');
      expect(parseFloat(updatedReceipt.total)).toBe(125.50);
      expect(updatedReceipt.expense_category).toBe('office_supplies');
      expect(updatedReceipt.is_business_expense).toBe(true);
      expect(updatedReceipt.items).toHaveLength(3);
    });
  });
});
