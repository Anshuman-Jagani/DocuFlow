'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('contracts');

    if (!tableDesc.contract_title) {
      await queryInterface.addColumn('contracts', 'contract_title', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (!tableDesc.contract_value) {
      await queryInterface.addColumn('contracts', 'contract_value', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      });
    }

    if (!tableDesc.currency) {
      await queryInterface.addColumn('contracts', 'currency', {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'USD'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contracts', 'currency');
    await queryInterface.removeColumn('contracts', 'contract_value');
    await queryInterface.removeColumn('contracts', 'contract_title');
  }
};
