'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
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
      contract_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parties: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      effective_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      auto_renewal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      payment_terms: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      key_obligations: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      termination_clauses: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      penalties: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      confidentiality_terms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      liability_limitations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      governing_law: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      special_conditions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      risk_score: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      red_flags: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      requires_legal_review: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      summary: {
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

    await queryInterface.addIndex('contracts', ['document_id']);
    await queryInterface.addIndex('contracts', ['contract_type']);
    await queryInterface.addIndex('contracts', ['expiration_date']);
    await queryInterface.addIndex('contracts', ['risk_score']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contracts');
  }
};
