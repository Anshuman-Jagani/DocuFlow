'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resumes', {
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
      candidate_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      linkedin_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      github_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      professional_summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      education: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { technical: [], soft_skills: [], tools: [] }
      },
      certifications: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      total_years_experience: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'job_postings',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      match_score: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      match_breakdown: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      matched_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      missing_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      recommendation: {
        type: Sequelize.ENUM('strong_yes', 'yes', 'maybe', 'no', 'strong_no'),
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

    await queryInterface.addIndex('resumes', ['document_id']);
    await queryInterface.addIndex('resumes', ['candidate_name']);
    await queryInterface.addIndex('resumes', ['job_id']);
    await queryInterface.addIndex('resumes', ['match_score']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('resumes');
  }
};
