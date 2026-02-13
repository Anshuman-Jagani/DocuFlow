'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Store the latest access token issued to a user
    await queryInterface.addColumn('users', 'access_token', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Track when the access token expires (should mirror JWT expiry)
    await queryInterface.addColumn('users', 'token_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'access_token');
    await queryInterface.removeColumn('users', 'token_expires_at');
  }
};

