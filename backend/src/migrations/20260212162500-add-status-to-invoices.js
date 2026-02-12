'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to invoices table
    await queryInterface.addColumn('invoices', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove status column
    await queryInterface.removeColumn('invoices', 'status');
    
    // Drop the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_invoices_status";');
  }
};
