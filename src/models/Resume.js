const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Resume = sequelize.define('Resume', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    candidate_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    linkedin_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    github_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    professional_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    education: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        technical: [],
        soft_skills: [],
        tools: []
      }
    },
    certifications: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    total_years_experience: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'job_postings',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    match_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    match_breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    matched_skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    missing_skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    recommendation: {
      type: DataTypes.ENUM('strong_yes', 'yes', 'maybe', 'no', 'strong_no'),
      allowNull: true
    }
  }, {
    tableName: 'resumes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['document_id'] },
      { fields: ['candidate_name'] },
      { fields: ['job_id'] },
      { fields: ['match_score'] }
    ]
  });

  return Resume;
};
