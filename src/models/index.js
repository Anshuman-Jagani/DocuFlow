const { sequelize } = require('../config/database');

// Import models
const User = require('./User')(sequelize);
const Document = require('./Document')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const Resume = require('./Resume')(sequelize);
const Contract = require('./Contract')(sequelize);
const Receipt = require('./Receipt')(sequelize);
const JobPosting = require('./JobPosting')(sequelize);

// Define associations
User.hasMany(Document, {
  foreignKey: 'user_id',
  as: 'documents',
  onDelete: 'CASCADE'
});

Document.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Document.hasOne(Invoice, {
  foreignKey: 'document_id',
  as: 'invoice',
  onDelete: 'CASCADE'
});

Invoice.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document'
});

Document.hasOne(Resume, {
  foreignKey: 'document_id',
  as: 'resume',
  onDelete: 'CASCADE'
});

Resume.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document'
});

Document.hasOne(Contract, {
  foreignKey: 'document_id',
  as: 'contract',
  onDelete: 'CASCADE'
});

Contract.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document'
});

Document.hasOne(Receipt, {
  foreignKey: 'document_id',
  as: 'receipt',
  onDelete: 'CASCADE'
});

Receipt.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document'
});

JobPosting.hasMany(Resume, {
  foreignKey: 'job_id',
  as: 'resumes',
  onDelete: 'SET NULL'
});

Resume.belongsTo(JobPosting, {
  foreignKey: 'job_id',
  as: 'job'
});

// Export models
module.exports = {
  sequelize,
  User,
  Document,
  Invoice,
  Resume,
  Contract,
  Receipt,
  JobPosting
};
