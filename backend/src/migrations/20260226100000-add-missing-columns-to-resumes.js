'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('resumes');

    // Add current_position - used by webhook to store candidate's current job title
    if (!tableDesc.current_position) {
      await queryInterface.addColumn('resumes', 'current_position', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    // Add confidence_score - set by n8n webhook after AI processing
    if (!tableDesc.confidence_score) {
      await queryInterface.addColumn('resumes', 'confidence_score', {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 0, max: 100 }
      });
    }

    // Add user_id if missing (required for multi-tenancy)
    if (!tableDesc.user_id) {
      await queryInterface.addColumn('resumes', 'user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('resumes');

    if (tableDesc.current_position) {
      await queryInterface.removeColumn('resumes', 'current_position');
    }
    if (tableDesc.confidence_score) {
      await queryInterface.removeColumn('resumes', 'confidence_score');
    }
    if (tableDesc.user_id) {
      await queryInterface.removeColumn('resumes', 'user_id');
    }
  }
};
