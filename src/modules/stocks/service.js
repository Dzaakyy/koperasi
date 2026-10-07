const { Product, StockHistory, User, sequelize } = require('../../../db/models');
const { Op } = require('sequelize');

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

  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date);
    const endDate = new Date(query.end_date);
    if (query.end_date.length <= 10) {
      endDate.setHours(23, 59, 59, 999);
    }
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
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
    order: [['createdAt', 'DESC']],
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

// 4. Hapus Riwayat Stok Manual (Batal Mutasi)
const deleteHistory = async (id) => {
  const t = await sequelize.transaction();
  try {
    const history = await StockHistory.findByPk(id, { transaction: t });
    if (!history) {
      const err = new Error('Data riwayat stok tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (history.note && history.note.includes('Terjual di Kasir POS')) {
      const err = new Error('Tidak bisa menghapus mutasi stok kasir dari sini. Silakan hapus di Riwayat Transaksi.');
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(history.product_id, { transaction: t });
    if (product) {
      // Restore stock: If history was -4 (out), we subtract -4 (meaning +4). If history was +10, we subtract +10.
      const restoredStock = product.stock - history.quantity;
      await product.update({ stock: restoredStock }, { transaction: t });
    }

    await history.destroy({ transaction: t });
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  addStock,
  reduceStock,
  getHistories,
  deleteHistory,
};
