'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'extracted_text', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });

    // Add index for faster queries on extracted_text (optional but recommended)
    await queryInterface.addIndex('documents', ['extracted_text'], {
      name: 'idx_documents_extracted_text',
      where: {
        extracted_text: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('documents', 'idx_documents_extracted_text');
    
    // Then remove column
    await queryInterface.removeColumn('documents', 'extracted_text');
  }
};
