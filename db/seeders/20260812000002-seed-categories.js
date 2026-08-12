'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { name: 'Makanan', created_at: now, updated_at: now },
      { name: 'Minuman', created_at: now, updated_at: now },
      { name: 'Pakaian', created_at: now, updated_at: now },
      { name: 'Alat Tulis', created_at: now, updated_at: now },
      { name: 'Komputer', created_at: now, updated_at: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', {
      name: ['Makanan', 'Minuman', 'Pakaian', 'Alat Tulis', 'Komputer']
    }, {});
  }
};
