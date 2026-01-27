'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      document_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invoice_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      invoice_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      vendor_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      vendor_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_tax_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      vendor_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      customer_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      line_items: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      tax: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'USD'
      },
      payment_terms: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      validation_status: {
        type: Sequelize.ENUM('valid', 'needs_review', 'invalid'),
        allowNull: true
      },
      validation_errors: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      confidence_score: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('invoices', ['document_id']);
    await queryInterface.addIndex('invoices', ['vendor_name']);
    await queryInterface.addIndex('invoices', ['invoice_date']);
    await queryInterface.addIndex('invoices', ['invoice_number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
  }
};
