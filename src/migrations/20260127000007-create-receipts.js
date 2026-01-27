'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('receipts', {
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
      merchant_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      purchase_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      items: {
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
      tip: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'USD'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      expense_category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      is_business_expense: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_reimbursable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tax_deductible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('receipts', ['document_id']);
    await queryInterface.addIndex('receipts', ['merchant_name']);
    await queryInterface.addIndex('receipts', ['purchase_date']);
    await queryInterface.addIndex('receipts', ['expense_category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('receipts');
  }
};
