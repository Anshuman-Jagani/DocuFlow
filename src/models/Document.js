const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
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
    document_type: {
      type: DataTypes.ENUM('invoice', 'resume', 'contract', 'receipt'),
      allowNull: false
    },
    original_filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    processing_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'needs_review'),
      defaultValue: 'pending',
      allowNull: false
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['document_type'] },
      { fields: ['processing_status'] },
      { fields: ['upload_date'] }
    ]
  });

  return Document;
};
