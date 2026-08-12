'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrator',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'admin' }, {});
  }
};
