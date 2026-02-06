'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ['invoices', 'receipts', 'resumes', 'contracts'];
    
    for (const table of tables) {
      await queryInterface.addColumn(table, 'user_id', {
        type: Sequelize.UUID,
        allowNull: true, // Set to true initially to avoid breaking existing data
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });

      // Attempt to populate user_id from the related document if data exists
      await queryInterface.sequelize.query(`
        UPDATE ${table} t
        SET user_id = d.user_id
        FROM documents d
        WHERE t.document_id = d.id
      `);

      // After population, we can transition to allowNull: false if desired,
      // but keeping it nullable for now to be safe with migrations.
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = ['invoices', 'receipts', 'resumes', 'contracts'];
    
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'user_id');
    }
  }
};
