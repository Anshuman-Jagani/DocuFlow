const { sequelize, User, Document, Invoice, Resume, Contract, Receipt, JobPosting } = require('../../src/models');

/**
 * Test Helpers for Database Model Testing
 */

/**
 * Setup test database - sync all models
 */
async function setupTestDB() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Test database synced');
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

/**
 * Teardown test database - close connection
 */
async function teardownTestDB() {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error tearing down test database:', error);
    throw error;
  }
}

/**
 * Clean all tables
 */
async function cleanDatabase() {
  try {
    await Receipt.destroy({ where: {}, force: true });
    await Contract.destroy({ where: {}, force: true });
    await Resume.destroy({ where: {}, force: true });
    await Invoice.destroy({ where: {}, force: true });
    await JobPosting.destroy({ where: {}, force: true });
    await Document.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('✅ Database cleaned');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
}

/**
 * Factory: Create test user
 */
async function createTestUser(overrides = {}) {
  const bcrypt = require('bcryptjs');
  
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password_hash: await bcrypt.hash('Test@12345', 10),
    full_name: 'Test User',
    role: 'user'
  };

  return await User.create({ ...defaultUser, ...overrides });
}

/**
 * Factory: Create test document
 */
async function createTestDocument(userId, typeOrOverrides = {}) {
  // Handle both string (document type) and object (overrides) as second parameter
  let overrides = {};
  if (typeof typeOrOverrides === 'string') {
    overrides = { document_type: typeOrOverrides };
  } else {
    overrides = typeOrOverrides;
  }
  
  const defaultDocument = {
    user_id: userId,
    filename: `test-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`,
    original_filename: 'test-document.pdf',
    file_path: '/uploads/test.pdf',
    file_size: 1024,
    mime_type: 'application/pdf',
    document_type: 'invoice',
    processing_status: 'completed'
  };

  return await Document.create({ ...defaultDocument, ...overrides });
}

/**
 * Factory: Create test invoice
 */
async function createTestInvoice(documentId, overrides = {}) {
  const defaultInvoice = {
    document_id: documentId,
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date('2024-01-15'),
    due_date: new Date('2024-02-15'),
    vendor_name: 'Test Vendor Inc.',
    vendor_address: '123 Test St, Test City, TC 12345',
    vendor_tax_id: 'TAX123456',
    vendor_email: 'vendor@test.com',
    customer_name: 'Test Customer',
    customer_address: '456 Customer Ave, Customer City, CC 67890',
    line_items: [
      {
        description: 'Product A',
        quantity: 2,
        unit_price: 100.00,
        amount: 200.00
      },
      {
        description: 'Product B',
        quantity: 1,
        unit_price: 150.00,
        amount: 150.00
      }
    ],
    subtotal: 350.00,
    tax: 35.00,
    total_amount: 385.00,
    currency: 'USD',
    payment_terms: 'Net 30',
    validation_status: 'valid',
    validation_errors: [],
    confidence_score: 95
  };

  // Ensure user_id is provided, either from overrides or by fetching the document
  if (!overrides.user_id) {
    const doc = await Document.findByPk(documentId);
    if (doc) {
      overrides.user_id = doc.user_id;
    }
  }

  return await Invoice.create({ ...defaultInvoice, ...overrides });
}

/**
 * Factory: Create test resume
 */
async function createTestResume(documentId, overrides = {}) {
  const defaultResume = {
    document_id: documentId,
    candidate_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    location: 'San Francisco, CA',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    github_url: 'https://github.com/johndoe',
    professional_summary: 'Experienced software engineer with 5+ years in full-stack development.',
    experience: [
      {
        company: 'Tech Corp',
        position: 'Senior Developer',
        start_date: '2020-01',
        end_date: '2024-01',
        description: 'Led development of microservices architecture'
      },
      {
        company: 'Startup Inc',
        position: 'Full Stack Developer',
        start_date: '2018-06',
        end_date: '2020-01',
        description: 'Built web applications using React and Node.js'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduation_year: 2018
      }
    ],
    skills: {
      technical: ['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL'],
      soft_skills: ['Leadership', 'Communication', 'Problem Solving'],
      tools: ['Git', 'Docker', 'AWS', 'Jenkins']
    },
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-06'
      }
    ],
    total_years_experience: 5.5,
    match_score: null,
    match_breakdown: {},
    matched_skills: [],
    missing_skills: [],
    recommendation: null
  };

  // Ensure user_id is provided, either from overrides or by fetching the document
  if (!overrides.user_id) {
    const doc = await Document.findByPk(documentId);
    if (doc) {
      overrides.user_id = doc.user_id;
    }
  }

  return await Resume.create({ ...defaultResume, ...overrides });
}

/**
 * Factory: Create test contract
 */
async function createTestContract(documentId, overrides = {}) {
  const defaultContract = {
    document_id: documentId,
    contract_type: 'Service Agreement',
    parties: [
      {
        name: 'Company A',
        role: 'Service Provider',
        address: '123 Business St'
      },
      {
        name: 'Company B',
        role: 'Client',
        address: '456 Client Ave'
      }
    ],
    effective_date: new Date('2024-01-01'),
    expiration_date: new Date('2025-01-01'),
    auto_renewal: false,
    payment_terms: {
      amount: 10000,
      frequency: 'monthly',
      due_date: 'first of month'
    },
    key_obligations: [
      'Provide monthly reports',
      'Maintain service uptime of 99.9%',
      'Respond to issues within 24 hours'
    ],
    termination_clauses: [
      '30 days written notice',
      'Immediate termination for breach'
    ],
    penalties: [
      {
        condition: 'Service downtime exceeds 1%',
        penalty: 'Pro-rated refund'
      }
    ],
    confidentiality_terms: 'All information shared is confidential for 5 years.',
    liability_limitations: 'Liability limited to contract value.',
    governing_law: 'State of California',
    special_conditions: [],
    risk_score: 25,
    red_flags: [],
    requires_legal_review: false,
    summary: 'Standard service agreement with low risk.'
  };

  // Ensure user_id is provided, either from overrides or by fetching the document
  if (!overrides.user_id) {
    const doc = await Document.findByPk(documentId);
    if (doc) {
      overrides.user_id = doc.user_id;
    }
  }

  return await Contract.create({ ...defaultContract, ...overrides });
}

/**
 * Factory: Create test receipt
 */
async function createTestReceipt(documentId, overrides = {}) {
  const defaultReceipt = {
    document_id: documentId,
    merchant_name: 'Coffee Shop',
    purchase_date: new Date('2024-01-20'),
    purchase_time: '14:30:00',
    items: [
      {
        name: 'Latte',
        quantity: 2,
        unit_price: 4.50,
        amount: 9.00
      },
      {
        name: 'Croissant',
        quantity: 1,
        unit_price: 3.50,
        amount: 3.50
      }
    ],
    subtotal: 12.50,
    tax: 1.25,
    tip: 2.50,
    total_amount: 16.25,
    currency: 'USD',
    payment_method: 'Credit Card',
    expense_category: 'Meals & Entertainment',
    is_business_expense: true,
    is_reimbursable: true,
    tax_deductible: true,
    notes: 'Client meeting'
  };

  // Ensure user_id is provided, either from overrides or by fetching the document
  if (!overrides.user_id) {
    const doc = await Document.findByPk(documentId);
    if (doc) {
      overrides.user_id = doc.user_id;
    }
  }

  return await Receipt.create({ ...defaultReceipt, ...overrides });
}

/**
 * Factory: Create test job posting
 */
async function createTestJobPosting(overrides = {}) {
  const defaultJob = {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer to join our growing team. The ideal candidate will have strong experience in full-stack development.',
    required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    preferred_skills: ['TypeScript', 'AWS', 'Docker'],
    experience_required: '5-10 years',
    location: 'San Francisco, CA',
    status: 'open'
  };

  return await JobPosting.create({ ...defaultJob, ...overrides });
}

/**
 * Generate authentication token for test user
 */
function generateAuthToken(user) {
  const jwt = require('jsonwebtoken');
  const { jwtConfig } = require('../../src/config/jwt');
  
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    jwtConfig.secret,
    { expiresIn: '24h' }
  );
}

module.exports = {
  setupTestDB,
  teardownTestDB,
  cleanDatabase,
  createTestUser,
  createTestDocument,
  createTestInvoice,
  createTestResume,
  createTestContract,
  createTestReceipt,
  createTestJobPosting,
  generateAuthToken
};
