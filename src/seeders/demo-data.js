/**
 * Demo Data Seeder
 * Creates sample data for testing and demonstration
 * Run with: npm run seed
 */

require('dotenv').config();
const { User, Document, Invoice, Resume, Contract, Receipt, JobPosting, sequelize } = require('../models');
const logger = require('../utils/logger');

const demoData = {
  users: [
    {
      email: 'admin@docuflow.com',
      password: 'Admin123!',
      full_name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'john.doe@example.com',
      password: 'User123!',
      full_name: 'John Doe',
      role: 'user'
    },
    {
      email: 'jane.smith@example.com',
      password: 'User123!',
      full_name: 'Jane Smith',
      role: 'user'
    },
    {
      email: 'bob.wilson@example.com',
      password: 'User123!',
      full_name: 'Bob Wilson',
      role: 'user'
    },
    {
      email: 'alice.johnson@example.com',
      password: 'User123!',
      full_name: 'Alice Johnson',
      role: 'user'
    }
  ],

  jobPostings: [
    {
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Inc',
      location: 'San Francisco, CA',
      job_type: 'full-time',
      experience_level: 'senior',
      required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      preferred_skills: ['TypeScript', 'Docker', 'AWS'],
      description: 'Looking for an experienced full stack developer'
    },
    {
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      job_type: 'full-time',
      experience_level: 'mid',
      required_skills: ['React', 'JavaScript', 'CSS'],
      preferred_skills: ['Next.js', 'Tailwind'],
      description: 'Join our growing frontend team'
    },
    {
      title: 'Backend Engineer',
      company: 'DataSystems LLC',
      location: 'New York, NY',
      job_type: 'full-time',
      experience_level: 'senior',
      required_skills: ['Python', 'Django', 'PostgreSQL'],
      preferred_skills: ['Redis', 'Celery', 'Docker'],
      description: 'Build scalable backend systems'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing demo data...');
    await Receipt.destroy({ where: {} });
    await Contract.destroy({ where: {} });
    await Resume.destroy({ where: {} });
    await Invoice.destroy({ where: {} });
    await Document.destroy({ where: {} });
    await JobPosting.destroy({ where: {} });
    await User.destroy({ where: { email: { [sequelize.Sequelize.Op.like]: '%@docuflow.com' } } });
    await User.destroy({ where: { email: { [sequelize.Sequelize.Op.like]: '%@example.com' } } });
    console.log('✅ Cleared existing data\n');

    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (const userData of demoData.users) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✓ Created user: ${user.email}`);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Create job postings
    console.log('💼 Creating job postings...');
    const jobs = [];
    for (const jobData of demoData.jobPostings) {
      const job = await JobPosting.create({
        ...jobData,
        user_id: users[0].user_id // Admin user
      });
      jobs.push(job);
      console.log(`   ✓ Created job: ${job.title}`);
    }
    console.log(`✅ Created ${jobs.length} job postings\n`);

    // Create sample documents for each user
    console.log('📄 Creating documents...');
    let documentCount = 0;

    for (let i = 1; i < users.length; i++) {
      const user = users[i];

      // Create 2 invoices per user
      for (let j = 1; j <= 2; j++) {
        const doc = await Document.create({
          user_id: user.user_id,
          document_type: 'invoice',
          file_name: `invoice_${user.user_id}_${j}.pdf`,
          file_path: `/uploads/demo/invoice_${user.user_id}_${j}.pdf`,
          file_size: Math.floor(Math.random() * 500000) + 100000,
          mime_type: 'application/pdf',
          processing_status: 'completed'
        });

        await Invoice.create({
          document_id: doc.document_id,
          user_id: user.user_id,
          invoice_number: `INV-2024-${1000 + documentCount}`,
          vendor_name: ['Acme Corp', 'TechSupplies Inc', 'Office Depot', 'Cloud Services Ltd'][Math.floor(Math.random() * 4)],
          invoice_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          due_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          total_amount: (Math.random() * 5000 + 500).toFixed(2),
          currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
          status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)],
          line_items: [
            {
              description: 'Product/Service',
              quantity: Math.floor(Math.random() * 10) + 1,
              unit_price: (Math.random() * 500).toFixed(2),
              amount: (Math.random() * 1000).toFixed(2)
            }
          ],
          confidence_score: Math.floor(Math.random() * 20) + 80
        });

        documentCount++;
      }

      // Create 1 resume per user
      const resumeDoc = await Document.create({
        user_id: user.user_id,
        document_type: 'resume',
        file_name: `resume_${user.full_name.replace(' ', '_')}.pdf`,
        file_path: `/uploads/demo/resume_${user.user_id}.pdf`,
        file_size: Math.floor(Math.random() * 300000) + 50000,
        mime_type: 'application/pdf',
        processing_status: 'completed'
      });

      const skills = [
        ['JavaScript', 'React', 'Node.js'],
        ['Python', 'Django', 'PostgreSQL'],
        ['Java', 'Spring Boot', 'MySQL'],
        ['Go', 'Docker', 'Kubernetes']
      ][i % 4];

      await Resume.create({
        document_id: resumeDoc.document_id,
        user_id: user.user_id,
        candidate_name: user.full_name,
        email: user.email,
        phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
        skills: {
          technical: skills,
          soft_skills: ['Communication', 'Teamwork', 'Problem Solving'],
          tools: ['Git', 'VS Code', 'Jira']
        },
        experience: [
          {
            company: 'Previous Company',
            position: 'Software Developer',
            duration: '2020-2023',
            description: 'Developed web applications'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            institution: 'University',
            year: '2020'
          }
        ],
        years_of_experience: Math.floor(Math.random() * 10) + 1,
        confidence_score: Math.floor(Math.random() * 20) + 75
      });

      documentCount++;

      // Create 1 contract per user
      const contractDoc = await Document.create({
        user_id: user.user_id,
        document_type: 'contract',
        file_name: `contract_${user.user_id}.pdf`,
        file_path: `/uploads/demo/contract_${user.user_id}.pdf`,
        file_size: Math.floor(Math.random() * 400000) + 100000,
        mime_type: 'application/pdf',
        processing_status: 'completed'
      });

      await Contract.create({
        document_id: contractDoc.document_id,
        user_id: user.user_id,
        contract_type: ['employment', 'service', 'nda', 'lease'][Math.floor(Math.random() * 4)],
        contract_title: `${['Employment', 'Service', 'NDA', 'Lease'][Math.floor(Math.random() * 4)]} Agreement`,
        parties: [
          { name: user.full_name, role: 'Employee' },
          { name: 'Company XYZ', role: 'Employer' }
        ],
        start_date: new Date(2024, 0, 1),
        expiration_date: new Date(2025, 11, 31),
        payment_terms: {
          amount: (Math.random() * 100000 + 50000).toFixed(2),
          frequency: 'monthly',
          currency: 'USD'
        },
        key_obligations: ['Deliver services', 'Maintain confidentiality', 'Meet deadlines'],
        red_flags: Math.random() > 0.7 ? ['Unclear termination clause'] : [],
        risk_score: Math.floor(Math.random() * 100),
        status: 'active',
        confidence_score: Math.floor(Math.random() * 20) + 80
      });

      documentCount++;

      // Create 2 receipts per user
      for (let j = 1; j <= 2; j++) {
        const receiptDoc = await Document.create({
          user_id: user.user_id,
          document_type: 'receipt',
          file_name: `receipt_${user.user_id}_${j}.pdf`,
          file_path: `/uploads/demo/receipt_${user.user_id}_${j}.pdf`,
          file_size: Math.floor(Math.random() * 200000) + 50000,
          mime_type: 'application/pdf',
          processing_status: 'completed'
        });

        const categories = ['office_supplies', 'travel', 'meals', 'software', 'utilities'];
        await Receipt.create({
          document_id: receiptDoc.document_id,
          user_id: user.user_id,
          merchant_name: ['Amazon', 'Staples', 'Uber', 'Restaurant', 'Adobe'][Math.floor(Math.random() * 5)],
          purchase_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          total_amount: (Math.random() * 500 + 10).toFixed(2),
          currency: 'USD',
          payment_method: ['credit_card', 'debit_card', 'cash'][Math.floor(Math.random() * 3)],
          expense_category: categories[Math.floor(Math.random() * categories.length)],
          items: [
            {
              name: 'Item',
              quantity: Math.floor(Math.random() * 5) + 1,
              unit_price: (Math.random() * 100).toFixed(2),
              amount: (Math.random() * 200).toFixed(2)
            }
          ],
          is_business_expense: Math.random() > 0.5,
          confidence_score: Math.floor(Math.random() * 20) + 75
        });

        documentCount++;
      }
    }

    console.log(`✅ Created ${documentCount} documents\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Job Postings: ${jobs.length}`);
    console.log(`   - Documents: ${documentCount}`);
    console.log(`     • Invoices: ${users.length - 1} × 2 = ${(users.length - 1) * 2}`);
    console.log(`     • Resumes: ${users.length - 1}`);
    console.log(`     • Contracts: ${users.length - 1}`);
    console.log(`     • Receipts: ${users.length - 1} × 2 = ${(users.length - 1) * 2}`);
    console.log('\n✅ You can now login with:');
    console.log('   Email: admin@docuflow.com');
    console.log('   Password: Admin123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    logger.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
