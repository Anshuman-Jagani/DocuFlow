const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobPosting = sequelize.define('JobPosting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    required_skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    preferred_skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    experience_required: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      defaultValue: 'open',
      allowNull: false
    }
  }, {
    tableName: 'job_postings',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['title'] }
    ]
  });

  return JobPosting;
};
