const { Category, Product } = require('../../../db/models');
const { Op } = require('sequelize');

async function getAll() {
  const categories = await Category.findAll({
    order: [['name', 'ASC']]
  });
  return categories;
}

async function getById(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Kategori tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return category;
}

async function create(data) {
  const existing = await Category.findOne({
    where: {
      name: { [Op.like]: data.name }
    }
  });

  if (existing) {
    const err = new Error('Kategori sudah ada');
    err.statusCode = 409;
    throw err;
  }

  const category = await Category.create(data);
  return category;
}

async function update(id, data) {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Kategori tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const existing = await Category.findOne({
    where: {
      name: { [Op.like]: data.name },
      id: { [Op.ne]: id }
    }
  });

  if (existing) {
    const err = new Error('Kategori sudah ada');
    err.statusCode = 409;
    throw err;
  }

  await category.update(data);
  return category;
}

async function remove(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Kategori tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const productCount = await Product.count({
    where: { category_id: id }
  });

  if (productCount > 0) {
    const err = new Error('Kategori tidak dapat dihapus karena masih digunakan oleh barang');
    err.statusCode = 400;
    throw err;
  }

  await category.destroy();
  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
