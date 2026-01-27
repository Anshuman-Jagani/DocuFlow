const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receipt = sequelize.define('Receipt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    merchant_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    purchase_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    tax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    tip: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    expense_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_business_expense: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_reimbursable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tax_deductible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'receipts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['document_id'] },
      { fields: ['merchant_name'] },
      { fields: ['purchase_date'] },
      { fields: ['expense_category'] }
    ]
  });

  return Receipt;
};
