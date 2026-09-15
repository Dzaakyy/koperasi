const { Product, StockHistory, User, sequelize } = require('../../../db/models');
const { Op } = require('sequelize');
const { parseDateRange } = require('../../utils/date');

// 1. Tambah Stok Masuk
const addStock = async (data, userId) => {
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(data.product_id, { transaction: t });
    if (!product) {
      const err = new Error('Barang tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const newStock = product.stock + data.quantity;
    await product.update({ stock: newStock }, { transaction: t });

    const stockHistory = await StockHistory.create(
      {
        product_id: data.product_id,
        user_id: userId,
        quantity: data.quantity,
        note: data.note || 'Barang masuk dari supplier',
      },
      { transaction: t }
    );

    await t.commit();

    return {
      product,
      stockHistory,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// 2. Catat Barang Keluar (Rusak, Expired, Retur, dll)
const reduceStock = async (data, userId) => {
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(data.product_id, { transaction: t });
    if (!product) {
      const err = new Error('Barang tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (product.stock < data.quantity) {
      const err = new Error(`Stok saat ini (${product.stock}) tidak mencukupi untuk dikeluarkan sebanyak ${data.quantity}`);
      err.statusCode = 400;
      throw err;
    }

    const newStock = product.stock - data.quantity;
    await product.update({ stock: newStock }, { transaction: t });

    const stockHistory = await StockHistory.create(
      {
        product_id: data.product_id,
        user_id: userId,
        quantity: -Math.abs(data.quantity), // Disimpan minus agar terdata sebagai stok keluar
        note: data.note || 'Pengeluaran Stok Manual',
      },
      { transaction: t }
    );

    await t.commit();

    return {
      product,
      stockHistory,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// 3. Ambil Riwayat Stok
const getHistories = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {};

  if (query.product_id !== undefined && query.product_id !== '') {
    where.product_id = parseInt(query.product_id);
  }

  const { startDate, endDate } = parseDateRange(query.start_date, query.end_date);
  if (startDate && endDate) {
    where.created_at = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.created_at = { [Op.gte]: startDate };
  } else if (endDate) {
    where.created_at = { [Op.lte]: endDate };
  }

  const { count, rows } = await StockHistory.findAndCountAll({
    where,
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'barcode', 'name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name'],
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true,
  });

  return {
    histories: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  addStock,
  reduceStock,
  getHistories,
};
