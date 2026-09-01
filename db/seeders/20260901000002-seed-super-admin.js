'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = bcrypt.hashSync('superadmin123', 10);
    await queryInterface.bulkInsert('users', [{
      name: 'Super Administrator',
      username: 'superadmin',
      password: hashedPassword,
      role: 'super_admin',
      status: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { username: 'superadmin' }, {});
  }
};
