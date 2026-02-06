const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contract_title: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    contract_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    contract_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    parties: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    auto_renewal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    payment_terms: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    key_obligations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    termination_clauses: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    penalties: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    confidentiality_terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    liability_limitations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    governing_law: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    special_conditions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    risk_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    red_flags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    requires_legal_review: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'contracts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['document_id'] },
      { fields: ['contract_type'] },
      { fields: ['expiration_date'] },
      { fields: ['risk_score'] }
    ]
  });

  return Contract;
};
