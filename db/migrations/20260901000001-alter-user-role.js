'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('super_admin', 'admin', 'kasir'),
      allowNull: false,
      defaultValue: 'kasir'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'kasir'),
      allowNull: false,
      defaultValue: 'kasir'
    });
  }
};
