const { sequelize, User, Document, Invoice, Resume, Contract, Receipt, JobPosting } = require('../../src/models');
const {
  setupTestDB,
  teardownTestDB,
  cleanDatabase,
  createTestUser,
  createTestDocument,
  createTestInvoice,
  createTestResume,
  createTestContract,
  createTestReceipt,
  createTestJobPosting
} = require('./testHelpers');

// Setup and teardown
beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await cleanDatabase();
});

// ============================================================================
// INVOICE MODEL TESTS
// ============================================================================

describe('Invoice Model', () => {
  let user, document;

  beforeEach(async () => {
    user = await createTestUser();
    document = await createTestDocument(user.id, { document_type: 'invoice' });
  });

  test('should create invoice with JSONB line_items', async () => {
    const invoice = await createTestInvoice(document.id);

    expect(invoice).toBeDefined();
    expect(invoice.id).toBeDefined();
    expect(invoice.line_items).toBeInstanceOf(Array);
    expect(invoice.line_items).toHaveLength(2);
    expect(invoice.line_items[0].description).toBe('Product A');
    expect(invoice.line_items[0].quantity).toBe(2);
  });

  test('should query invoices by JSONB field values', async () => {
    await createTestInvoice(document.id, {
      vendor_name: 'ACME Corp',
      line_items: [
        { description: 'Widget', quantity: 5, unit_price: 10, amount: 50 }
      ]
    });

    const invoices = await Invoice.findAll({
      where: {
        vendor_name: 'ACME Corp'
      }
    });

    expect(invoices).toHaveLength(1);
    expect(invoices[0].vendor_name).toBe('ACME Corp');
    expect(invoices[0].line_items[0].description).toBe('Widget');
  });

  test('should update JSONB validation_errors', async () => {
    const invoice = await createTestInvoice(document.id);

    await invoice.update({
      validation_status: 'needs_review',
      validation_errors: [
        { field: 'total_amount', message: 'Amount seems too high' }
      ]
    });

    const updated = await Invoice.findByPk(invoice.id);
    expect(updated.validation_status).toBe('needs_review');
    expect(updated.validation_errors).toHaveLength(1);
    expect(updated.validation_errors[0].field).toBe('total_amount');
  });

  test('should cascade delete when document is deleted', async () => {
    const invoice = await createTestInvoice(document.id);
    const invoiceId = invoice.id;

    await document.destroy();

    const deletedInvoice = await Invoice.findByPk(invoiceId);
    expect(deletedInvoice).toBeNull();
  });

  test('should validate confidence_score range', async () => {
    await expect(
      createTestInvoice(document.id, { confidence_score: 150 })
    ).rejects.toThrow();

    await expect(
      createTestInvoice(document.id, { confidence_score: -10 })
    ).rejects.toThrow();

    const validInvoice = await createTestInvoice(document.id, { confidence_score: 85 });
    expect(validInvoice.confidence_score).toBe(85);
  });

  test('should have default empty array for line_items', async () => {
    const invoice = await Invoice.create({
      document_id: document.id,
      invoice_number: 'INV-001'
    });

    expect(invoice.line_items).toEqual([]);
  });
});

// ============================================================================
// RESUME MODEL TESTS
// ============================================================================

describe('Resume Model', () => {
  let user, document;

  beforeEach(async () => {
    user = await createTestUser();
    document = await createTestDocument(user.id, { document_type: 'resume' });
  });

  test('should create resume with JSONB skills', async () => {
    const resume = await createTestResume(document.id);

    expect(resume).toBeDefined();
    expect(resume.skills).toBeDefined();
    expect(resume.skills.technical).toBeInstanceOf(Array);
    expect(resume.skills.technical).toContain('JavaScript');
    expect(resume.skills.technical).toContain('Python');
  });

  test('should handle complex experience array', async () => {
    const resume = await createTestResume(document.id);

    expect(resume.experience).toBeInstanceOf(Array);
    expect(resume.experience).toHaveLength(2);
    expect(resume.experience[0].company).toBe('Tech Corp');
    expect(resume.experience[0].position).toBe('Senior Developer');
  });

  test('should handle education JSONB field', async () => {
    const resume = await createTestResume(document.id);

    expect(resume.education).toBeInstanceOf(Array);
    expect(resume.education).toHaveLength(1);
    expect(resume.education[0].institution).toBe('University of Technology');
    expect(resume.education[0].degree).toBe('Bachelor of Science');
  });

  test('should associate with JobPosting', async () => {
    const job = await createTestJobPosting();
    const resume = await createTestResume(document.id, {
      job_id: job.id,
      match_score: 85
    });

    const resumeWithJob = await Resume.findByPk(resume.id, {
      include: [{ model: JobPosting, as: 'job' }]
    });

    expect(resumeWithJob.job).toBeDefined();
    expect(resumeWithJob.job.title).toBe('Senior Software Engineer');
  });

  test('should calculate and store match data', async () => {
    const job = await createTestJobPosting();
    const resume = await createTestResume(document.id, {
      job_id: job.id,
      match_score: 85,
      match_breakdown: {
        skills_match: 90,
        experience_match: 80,
        location_match: 85
      },
      matched_skills: ['JavaScript', 'React', 'Node.js'],
      missing_skills: ['TypeScript'],
      recommendation: 'yes'
    });

    expect(resume.match_score).toBe(85);
    expect(resume.match_breakdown.skills_match).toBe(90);
    expect(resume.matched_skills).toHaveLength(3);
    expect(resume.missing_skills).toContain('TypeScript');
    expect(resume.recommendation).toBe('yes');
  });

  test('should cascade delete when document is deleted', async () => {
    const resume = await createTestResume(document.id);
    const resumeId = resume.id;

    await document.destroy();

    const deletedResume = await Resume.findByPk(resumeId);
    expect(deletedResume).toBeNull();
  });

  test('should SET NULL on job_id when job is deleted', async () => {
    const job = await createTestJobPosting();
    const resume = await createTestResume(document.id, { job_id: job.id });

    expect(resume.job_id).toBe(job.id);

    await job.destroy();

    const updatedResume = await Resume.findByPk(resume.id);
    expect(updatedResume.job_id).toBeNull();
  });

  test('should validate match_score range', async () => {
    await expect(
      createTestResume(document.id, { match_score: 150 })
    ).rejects.toThrow();

    const validResume = await createTestResume(document.id, { match_score: 75 });
    expect(validResume.match_score).toBe(75);
  });
});

// ============================================================================
// CONTRACT MODEL TESTS
// ============================================================================

describe('Contract Model', () => {
  let user, document;

  beforeEach(async () => {
    user = await createTestUser();
    document = await createTestDocument(user.id, { document_type: 'contract' });
  });

  test('should create contract with JSONB parties', async () => {
    const contract = await createTestContract(document.id);

    expect(contract).toBeDefined();
    expect(contract.parties).toBeInstanceOf(Array);
    expect(contract.parties).toHaveLength(2);
    expect(contract.parties[0].name).toBe('Company A');
    expect(contract.parties[1].role).toBe('Client');
  });

  test('should validate risk_score range', async () => {
    await expect(
      createTestContract(document.id, { risk_score: 150 })
    ).rejects.toThrow();

    const validContract = await createTestContract(document.id, { risk_score: 45 });
    expect(validContract.risk_score).toBe(45);
  });

  test('should query by expiration_date', async () => {
    const futureDate = new Date('2025-12-31');
    await createTestContract(document.id, {
      contract_type: 'NDA',
      expiration_date: futureDate
    });

    const contracts = await Contract.findAll({
      where: {
        expiration_date: futureDate
      }
    });

    expect(contracts).toHaveLength(1);
    expect(contracts[0].contract_type).toBe('NDA');
  });

  test('should handle red_flags array', async () => {
    const contract = await createTestContract(document.id, {
      risk_score: 75,
      red_flags: [
        'Unlimited liability clause',
        'No termination clause',
        'Unclear payment terms'
      ],
      requires_legal_review: true
    });

    expect(contract.red_flags).toHaveLength(3);
    expect(contract.red_flags).toContain('Unlimited liability clause');
    expect(contract.requires_legal_review).toBe(true);
  });

  test('should handle payment_terms JSONB', async () => {
    const contract = await createTestContract(document.id, {
      payment_terms: {
        amount: 50000,
        frequency: 'quarterly',
        due_date: '15th of quarter',
        late_fee: 5
      }
    });

    expect(contract.payment_terms.amount).toBe(50000);
    expect(contract.payment_terms.frequency).toBe('quarterly');
  });

  test('should cascade delete when document is deleted', async () => {
    const contract = await createTestContract(document.id);
    const contractId = contract.id;

    await document.destroy();

    const deletedContract = await Contract.findByPk(contractId);
    expect(deletedContract).toBeNull();
  });
});

// ============================================================================
// RECEIPT MODEL TESTS
// ============================================================================

describe('Receipt Model', () => {
  let user, document;

  beforeEach(async () => {
    user = await createTestUser();
    document = await createTestDocument(user.id, { document_type: 'receipt' });
  });

  test('should create receipt with JSONB items', async () => {
    const receipt = await createTestReceipt(document.id);

    expect(receipt).toBeDefined();
    expect(receipt.items).toBeInstanceOf(Array);
    expect(receipt.items).toHaveLength(2);
    expect(receipt.items[0].name).toBe('Latte');
    expect(receipt.items[0].quantity).toBe(2);
  });

  test('should filter by expense_category', async () => {
    await createTestReceipt(document.id, {
      merchant_name: 'Office Supplies Inc',
      expense_category: 'Office Supplies'
    });

    const receipts = await Receipt.findAll({
      where: {
        expense_category: 'Office Supplies'
      }
    });

    expect(receipts).toHaveLength(1);
    expect(receipts[0].merchant_name).toBe('Office Supplies Inc');
  });

  test('should handle decimal amounts correctly', async () => {
    const receipt = await createTestReceipt(document.id, {
      subtotal: 123.45,
      tax: 12.35,
      tip: 18.52,
      total: 154.32
    });

    expect(parseFloat(receipt.subtotal)).toBe(123.45);
    expect(parseFloat(receipt.tax)).toBe(12.35);
    expect(parseFloat(receipt.tip)).toBe(18.52);
    expect(parseFloat(receipt.total)).toBe(154.32);
  });

  test('should handle business expense flags', async () => {
    const receipt = await createTestReceipt(document.id, {
      is_business_expense: true,
      is_reimbursable: true,
      tax_deductible: true
    });

    expect(receipt.is_business_expense).toBe(true);
    expect(receipt.is_reimbursable).toBe(true);
    expect(receipt.tax_deductible).toBe(true);
  });

  test('should cascade delete when document is deleted', async () => {
    const receipt = await createTestReceipt(document.id);
    const receiptId = receipt.id;

    await document.destroy();

    const deletedReceipt = await Receipt.findByPk(receiptId);
    expect(deletedReceipt).toBeNull();
  });
});

// ============================================================================
// MODEL ASSOCIATIONS TESTS
// ============================================================================

describe('Model Associations', () => {
  test('should cascade delete documents when user is deleted', async () => {
    const user = await createTestUser();
    const doc1 = await createTestDocument(user.id, { document_type: 'invoice' });
    const doc2 = await createTestDocument(user.id, { document_type: 'resume' });

    expect(await Document.count({ where: { user_id: user.id } })).toBe(2);

    await user.destroy();

    expect(await Document.count({ where: { user_id: user.id } })).toBe(0);
  });

  test('should cascade delete all related records when document is deleted', async () => {
    const user = await createTestUser();
    const document = await createTestDocument(user.id);

    const invoice = await createTestInvoice(document.id);
    const documentId = document.id;

    await document.destroy();

    expect(await Document.findByPk(documentId)).toBeNull();
    expect(await Invoice.findByPk(invoice.id)).toBeNull();
  });

  test('should load document with associated invoice', async () => {
    const user = await createTestUser();
    const document = await createTestDocument(user.id, { document_type: 'invoice' });
    await createTestInvoice(document.id);

    const docWithInvoice = await Document.findByPk(document.id, {
      include: [{ model: Invoice, as: 'invoice' }]
    });

    expect(docWithInvoice.invoice).toBeDefined();
    expect(docWithInvoice.invoice.document_id).toBe(document.id);
  });

  test('should load user with all documents', async () => {
    const user = await createTestUser();
    await createTestDocument(user.id, { document_type: 'invoice' });
    await createTestDocument(user.id, { document_type: 'resume' });
    await createTestDocument(user.id, { document_type: 'contract' });

    const userWithDocs = await User.findByPk(user.id, {
      include: [{ model: Document, as: 'documents' }]
    });

    expect(userWithDocs.documents).toHaveLength(3);
  });
});
