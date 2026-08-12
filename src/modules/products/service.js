const { Product, Category } = require('../../../db/models');
const { Op } = require('sequelize');

const getAll = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {};

  if (query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { barcode: { [Op.like]: `%${query.search}%` } },
    ];
  }

  if (query.category_id !== undefined && query.category_id !== '') {
    where.category_id = parseInt(query.category_id);
  }

  if (query.status !== undefined && query.status !== '') {
    if (typeof query.status === 'string') {
      where.status = query.status === 'true';
    } else {
      where.status = Boolean(query.status);
    }
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    products: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!product) {
    const err = new Error('Barang tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return product;
};

const getByBarcode = async (barcode) => {
  const product = await Product.findOne({
    where: { barcode },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!product) {
    const err = new Error('Barang dengan barcode tersebut tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return product;
};

const create = async (data) => {
  const existingBarcode = await Product.findOne({ where: { barcode: data.barcode } });
  if (existingBarcode) {
    const err = new Error('Barcode sudah digunakan');
    err.statusCode = 409;
    throw err;
  }

  const category = await Category.findByPk(data.category_id);
  if (!category) {
    const err = new Error('Kategori tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const product = await Product.create(data);

  return getById(product.id);
};

const update = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Barang tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (data.barcode && data.barcode !== product.barcode) {
    const existingBarcode = await Product.findOne({
      where: {
        barcode: data.barcode,
        id: { [Op.ne]: id },
      },
    });
    if (existingBarcode) {
      const err = new Error('Barcode sudah digunakan');
      err.statusCode = 409;
      throw err;
    }
  }

  if (data.category_id && data.category_id !== product.category_id) {
    const category = await Category.findByPk(data.category_id);
    if (!category) {
      const err = new Error('Kategori tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
  }

  await product.update(data);

  return getById(id);
};

const remove = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Barang tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  await product.update({ status: false });

  return { message: 'Barang berhasil dinonaktifkan' };
};

module.exports = {
  getAll,
  getById,
  getByBarcode,
  create,
  update,
  remove,
};
