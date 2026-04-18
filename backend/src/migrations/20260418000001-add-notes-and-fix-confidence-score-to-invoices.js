'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns already exist before adding (idempotent)
    const tableDesc = await queryInterface.describeTable('invoices');

    if (!tableDesc.notes) {
      await queryInterface.addColumn('invoices', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableDesc.confidence_score) {
      await queryInterface.addColumn('invoices', 'confidence_score', {
        type: Sequelize.FLOAT,
        allowNull: true
      });
    } else {
      // Alter existing confidence_score from INTEGER to FLOAT
      await queryInterface.changeColumn('invoices', 'confidence_score', {
        type: Sequelize.FLOAT,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('invoices');

    if (tableDesc.notes) {
      await queryInterface.removeColumn('invoices', 'notes');
    }

    if (tableDesc.confidence_score) {
      // Revert confidence_score back to INTEGER
      await queryInterface.changeColumn('invoices', 'confidence_score', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  }
};
