'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_postings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      required_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      preferred_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      experience_required: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        defaultValue: 'open',
        allowNull: false
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

    await queryInterface.addIndex('job_postings', ['status']);
    await queryInterface.addIndex('job_postings', ['title']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_postings');
  }
};
