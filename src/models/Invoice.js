const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
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
    invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    vendor_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor_tax_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    vendor_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    line_items: {
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
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    payment_terms: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    validation_status: {
      type: DataTypes.ENUM('valid', 'needs_review', 'invalid'),
      allowNull: true
    },
    validation_errors: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    confidence_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['document_id'] },
      { fields: ['vendor_name'] },
      { fields: ['invoice_date'] },
      { fields: ['invoice_number'] }
    ]
  });

  return Invoice;
};
