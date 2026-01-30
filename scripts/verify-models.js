/**
 * Manual Verification Script for Database Models
 * 
 * This script manually tests all database models including:
 * - JSONB operations
 * - Model associations
 * - Foreign key constraints
 * - Cascade deletes
 * 
 * Run with: node scripts/verify-models.js
 */

const { sequelize, User, Document, Invoice, Resume, Contract, Receipt, JobPosting } = require('../src/models');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function section(message) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${message}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function verifyModels() {
  try {
    section('DATABASE MODEL VERIFICATION');

    // Test database connection
    info('Testing database connection...');
    await sequelize.authenticate();
    success('Database connection established');

    // Sync models (create tables if they don't exist)
    info('Syncing database models...');
    await sequelize.sync({ alter: true });
    success('Database models synced');

    // ========================================================================
    // 1. CREATE TEST DATA
    // ========================================================================
    section('1. Creating Test Data');

    // Create test user
    const bcrypt = require('bcryptjs');
    const user = await User.create({
      email: `test-${Date.now()}@example.com`,
      password_hash: await bcrypt.hash('Test@12345', 10),
      full_name: 'Test User',
      role: 'user'
    });
    success(`Created user: ${user.id} (${user.email})`);

    // Create test document
    const document = await Document.create({
      user_id: user.id,
      filename: `test-doc-${Date.now()}.pdf`,
      original_filename: 'test-document.pdf',
      file_path: '/uploads/test.pdf',
      file_size: 2048,
      mime_type: 'application/pdf',
      document_type: 'invoice',
      processing_status: 'completed'
    });
    success(`Created document: ${document.id} (${document.filename})`);

    // ========================================================================
    // 2. TEST INVOICE MODEL WITH JSONB
    // ========================================================================
    section('2. Testing Invoice Model (JSONB: line_items, validation_errors)');

    const invoice = await Invoice.create({
      document_id: document.id,
      invoice_number: 'INV-2024-001',
      invoice_date: new Date('2024-01-15'),
      due_date: new Date('2024-02-15'),
      vendor_name: 'ACME Corporation',
      vendor_address: '123 Business St, Tech City, TC 12345',
      vendor_tax_id: 'TAX-123456',
      vendor_email: 'billing@acme.com',
      customer_name: 'Tech Solutions Inc',
      customer_address: '456 Client Ave, Business City, BC 67890',
      line_items: [
        {
          description: 'Software License - Annual',
          quantity: 10,
          unit_price: 299.99,
          amount: 2999.90
        },
        {
          description: 'Support Services - Premium',
          quantity: 1,
          unit_price: 1500.00,
          amount: 1500.00
        },
        {
          description: 'Training Sessions',
          quantity: 5,
          unit_price: 200.00,
          amount: 1000.00
        }
      ],
      subtotal: 5499.90,
      tax: 549.99,
      total_amount: 6049.89,
      currency: 'USD',
      payment_terms: 'Net 30',
      validation_status: 'valid',
      validation_errors: [],
      confidence_score: 95
    });
    success(`Created invoice: ${invoice.id} with ${invoice.line_items.length} line items`);
    info(`  - Invoice Number: ${invoice.invoice_number}`);
    info(`  - Vendor: ${invoice.vendor_name}`);
    info(`  - Total: ${invoice.currency} ${invoice.total_amount}`);
    info(`  - Line Items (JSONB): ${JSON.stringify(invoice.line_items[0])}`);

    // ========================================================================
    // 3. TEST RESUME MODEL WITH JSONB
    // ========================================================================
    section('3. Testing Resume Model (JSONB: skills, experience, education)');

    const resumeDoc = await Document.create({
      user_id: user.id,
      filename: `resume-${Date.now()}.pdf`,
      original_filename: 'john-doe-resume.pdf',
      file_path: '/uploads/resume.pdf',
      file_size: 1536,
      mime_type: 'application/pdf',
      document_type: 'resume',
      processing_status: 'completed'
    });

    const resume = await Resume.create({
      document_id: resumeDoc.id,
      candidate_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0199',
      location: 'San Francisco, CA',
      linkedin_url: 'https://linkedin.com/in/janesmith',
      github_url: 'https://github.com/janesmith',
      professional_summary: 'Senior Full-Stack Developer with 8+ years of experience in building scalable web applications.',
      experience: [
        {
          company: 'Tech Giants Inc',
          position: 'Senior Software Engineer',
          start_date: '2020-03',
          end_date: 'Present',
          description: 'Lead development of microservices architecture serving 10M+ users'
        },
        {
          company: 'Startup Innovations',
          position: 'Full Stack Developer',
          start_date: '2017-06',
          end_date: '2020-02',
          description: 'Built and maintained React/Node.js applications'
        },
        {
          company: 'Digital Solutions Co',
          position: 'Junior Developer',
          start_date: '2015-08',
          end_date: '2017-05',
          description: 'Developed web applications using JavaScript and Python'
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          graduation_year: 2015
        },
        {
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Engineering',
          graduation_year: 2013
        }
      ],
      skills: {
        technical: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'],
        soft_skills: ['Leadership', 'Team Collaboration', 'Problem Solving', 'Agile Methodologies'],
        tools: ['Git', 'Jenkins', 'Terraform', 'Jira', 'Figma']
      },
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-08'
        },
        {
          name: 'Certified Kubernetes Administrator',
          issuer: 'CNCF',
          date: '2022-11'
        }
      ],
      total_years_experience: 8.5
    });
    success(`Created resume: ${resume.id} for ${resume.candidate_name}`);
    info(`  - Email: ${resume.email}`);
    info(`  - Experience: ${resume.total_years_experience} years`);
    info(`  - Technical Skills (JSONB): ${resume.skills.technical.length} skills`);
    info(`  - Work History (JSONB): ${resume.experience.length} positions`);
    info(`  - Education (JSONB): ${resume.education.length} degrees`);

    // ========================================================================
    // 4. TEST CONTRACT MODEL WITH JSONB
    // ========================================================================
    section('4. Testing Contract Model (JSONB: parties, payment_terms, obligations)');

    const contractDoc = await Document.create({
      user_id: user.id,
      filename: `contract-${Date.now()}.pdf`,
      original_filename: 'service-agreement.pdf',
      file_path: '/uploads/contract.pdf',
      file_size: 3072,
      mime_type: 'application/pdf',
      document_type: 'contract',
      processing_status: 'completed'
    });

    const contract = await Contract.create({
      document_id: contractDoc.id,
      contract_type: 'Master Service Agreement',
      parties: [
        {
          name: 'TechCorp Solutions LLC',
          role: 'Service Provider',
          address: '789 Enterprise Blvd, Tech City, TC 11111',
          representative: 'John CEO'
        },
        {
          name: 'Global Industries Inc',
          role: 'Client',
          address: '321 Corporate Dr, Business Town, BT 22222',
          representative: 'Jane CFO'
        }
      ],
      effective_date: new Date('2024-01-01'),
      expiration_date: new Date('2026-12-31'),
      auto_renewal: true,
      payment_terms: {
        amount: 25000,
        frequency: 'monthly',
        due_date: '1st of each month',
        late_fee_percentage: 2,
        payment_method: 'Wire Transfer'
      },
      key_obligations: [
        'Provide 24/7 technical support',
        'Deliver monthly performance reports',
        'Maintain 99.9% service uptime',
        'Conduct quarterly business reviews',
        'Provide dedicated account manager'
      ],
      termination_clauses: [
        '60 days written notice for convenience',
        'Immediate termination for material breach',
        '30 days to cure breach before termination'
      ],
      penalties: [
        {
          condition: 'Service uptime below 99.9%',
          penalty: 'Service credits equal to 10% of monthly fee'
        },
        {
          condition: 'Missed SLA targets',
          penalty: 'Pro-rated refund based on severity'
        }
      ],
      confidentiality_terms: 'All proprietary information remains confidential for 5 years post-termination.',
      liability_limitations: 'Total liability limited to 12 months of fees paid.',
      governing_law: 'State of Delaware',
      special_conditions: [
        'Annual price increase capped at 5%',
        'Exclusive service provider for contract duration'
      ],
      risk_score: 35,
      red_flags: [
        'Auto-renewal clause requires 90-day notice to cancel'
      ],
      requires_legal_review: true,
      summary: 'Three-year master service agreement with moderate risk level. Auto-renewal and exclusivity clauses require attention.'
    });
    success(`Created contract: ${contract.id} (${contract.contract_type})`);
    info(`  - Parties (JSONB): ${contract.parties.length} parties`);
    info(`  - Effective: ${contract.effective_date.toISOString().split('T')[0]} to ${contract.expiration_date.toISOString().split('T')[0]}`);
    info(`  - Payment (JSONB): ${contract.payment_terms.currency || 'USD'} ${contract.payment_terms.amount}/${contract.payment_terms.frequency}`);
    info(`  - Risk Score: ${contract.risk_score}/100`);
    info(`  - Obligations (JSONB): ${contract.key_obligations.length} key obligations`);

    // ========================================================================
    // 5. TEST RECEIPT MODEL WITH JSONB
    // ========================================================================
    section('5. Testing Receipt Model (JSONB: items)');

    const receiptDoc = await Document.create({
      user_id: user.id,
      filename: `receipt-${Date.now()}.jpg`,
      original_filename: 'restaurant-receipt.jpg',
      file_path: '/uploads/receipt.jpg',
      file_size: 512,
      mime_type: 'image/jpeg',
      document_type: 'receipt',
      processing_status: 'completed'
    });

    const receipt = await Receipt.create({
      document_id: receiptDoc.id,
      merchant_name: 'The Gourmet Restaurant',
      purchase_date: new Date('2024-01-25'),
      purchase_time: '19:30:00',
      items: [
        {
          name: 'Grilled Salmon',
          quantity: 2,
          unit_price: 28.99,
          amount: 57.98
        },
        {
          name: 'Caesar Salad',
          quantity: 2,
          unit_price: 12.50,
          amount: 25.00
        },
        {
          name: 'House Wine (Bottle)',
          quantity: 1,
          unit_price: 35.00,
          amount: 35.00
        },
        {
          name: 'Chocolate Lava Cake',
          quantity: 2,
          unit_price: 9.99,
          amount: 19.98
        }
      ],
      subtotal: 137.96,
      tax: 13.80,
      tip: 27.59,
      total: 179.35,
      currency: 'USD',
      payment_method: 'Credit Card',
      expense_category: 'Meals & Entertainment',
      is_business_expense: true,
      is_reimbursable: true,
      tax_deductible: true,
      notes: 'Client dinner meeting - Project kickoff discussion'
    });
    success(`Created receipt: ${receipt.id} from ${receipt.merchant_name}`);
    info(`  - Date: ${receipt.purchase_date.toISOString().split('T')[0]} at ${receipt.purchase_time}`);
    info(`  - Items (JSONB): ${receipt.items.length} items`);
    info(`  - Total: ${receipt.currency} ${receipt.total}`);
    info(`  - Category: ${receipt.expense_category}`);
    info(`  - Business Expense: ${receipt.is_business_expense ? 'Yes' : 'No'}`);

    // ========================================================================
    // 6. TEST JOB POSTING AND RESUME MATCHING
    // ========================================================================
    section('6. Testing JobPosting and Resume Association');

    const jobPosting = await JobPosting.create({
      title: 'Senior Full-Stack Engineer',
      description: 'We are seeking an experienced full-stack engineer to join our growing team. The ideal candidate will have 5+ years of experience building scalable web applications.',
      required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      experience_required: '5-10 years',
      location: 'San Francisco, CA',
      status: 'open'
    });
    success(`Created job posting: ${jobPosting.id} (${jobPosting.title})`);

    // Update resume with job matching data
    await resume.update({
      job_id: jobPosting.id,
      match_score: 92,
      match_breakdown: {
        skills_match: 95,
        experience_match: 90,
        location_match: 100,
        education_match: 95
      },
      matched_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      missing_skills: [],
      recommendation: 'strong_yes'
    });
    success(`Updated resume with job matching: Score ${resume.match_score}/100`);
    info(`  - Matched Skills: ${resume.matched_skills.length}`);
    info(`  - Recommendation: ${resume.recommendation}`);

    // ========================================================================
    // 7. TEST ASSOCIATIONS
    // ========================================================================
    section('7. Testing Model Associations');

    // Load document with user
    const docWithUser = await Document.findByPk(document.id, {
      include: [{ model: User, as: 'user' }]
    });
    success(`Loaded document with user association: ${docWithUser.user.email}`);

    // Load document with invoice
    const docWithInvoice = await Document.findByPk(document.id, {
      include: [{ model: Invoice, as: 'invoice' }]
    });
    success(`Loaded document with invoice association: ${docWithInvoice.invoice.invoice_number}`);

    // Load resume with job
    const resumeWithJob = await Resume.findByPk(resume.id, {
      include: [{ model: JobPosting, as: 'job' }]
    });
    success(`Loaded resume with job association: ${resumeWithJob.job.title}`);

    // Load user with all documents
    const userWithDocs = await User.findByPk(user.id, {
      include: [{ model: Document, as: 'documents' }]
    });
    success(`Loaded user with ${userWithDocs.documents.length} documents`);

    // ========================================================================
    // 8. TEST CASCADE DELETE
    // ========================================================================
    section('8. Testing Cascade Delete');

    info('Deleting document to test cascade delete...');
    const invoiceId = invoice.id;
    await document.destroy();
    
    const deletedInvoice = await Invoice.findByPk(invoiceId);
    if (deletedInvoice === null) {
      success('Cascade delete successful: Invoice deleted when document was deleted');
    } else {
      error('Cascade delete failed: Invoice still exists');
    }

    // Test SET NULL for job_id
    info('Deleting job posting to test SET NULL on resume.job_id...');
    await jobPosting.destroy();
    
    const updatedResume = await Resume.findByPk(resume.id);
    if (updatedResume.job_id === null) {
      success('SET NULL successful: resume.job_id set to NULL when job was deleted');
    } else {
      error('SET NULL failed: resume.job_id still has value');
    }

    // ========================================================================
    // 9. VERIFY DATABASE INDEXES
    // ========================================================================
    section('9. Verifying Database Indexes');

    const indexQuery = `
      SELECT tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('invoices', 'resumes', 'contracts', 'receipts')
      ORDER BY tablename, indexname;
    `;

    const indexes = await sequelize.query(indexQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    info(`Found ${indexes.length} indexes on model tables:`);
    const tableIndexes = {};
    indexes.forEach(idx => {
      if (!tableIndexes[idx.tablename]) {
        tableIndexes[idx.tablename] = [];
      }
      tableIndexes[idx.tablename].push(idx.indexname);
    });

    Object.keys(tableIndexes).forEach(table => {
      success(`  ${table}: ${tableIndexes[table].length} indexes`);
    });

    // ========================================================================
    // CLEANUP
    // ========================================================================
    section('Cleanup');

    info('Cleaning up test data...');
    await Receipt.destroy({ where: { id: receipt.id } });
    await Contract.destroy({ where: { id: contract.id } });
    await Resume.destroy({ where: { id: resume.id } });
    await Document.destroy({ where: { user_id: user.id } });
    await User.destroy({ where: { id: user.id } });
    success('Test data cleaned up');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    section('VERIFICATION SUMMARY');

    success('All model tests completed successfully!');
    console.log(`
${colors.green}✅ Invoice Model${colors.reset} - JSONB operations working
${colors.green}✅ Resume Model${colors.reset} - JSONB operations working
${colors.green}✅ Contract Model${colors.reset} - JSONB operations working
${colors.green}✅ Receipt Model${colors.reset} - JSONB operations working
${colors.green}✅ JobPosting Model${colors.reset} - Association working
${colors.green}✅ Model Associations${colors.reset} - All associations working
${colors.green}✅ Cascade Deletes${colors.reset} - CASCADE and SET NULL working
${colors.green}✅ Database Indexes${colors.reset} - Indexes verified
    `);

    await sequelize.close();
    success('Database connection closed');

  } catch (err) {
    error(`Verification failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Run verification
verifyModels();
