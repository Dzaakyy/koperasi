const { Sale, SaleItem, Product, User, sequelize } = require('../../../db/models');
const { Op } = require('sequelize');

const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const count = await Sale.count({
    where: {
      createdAt: {
        [Op.gte]: startOfDay
      }
    }
  });
  return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const create = async (data, userId) => {
  const t = await sequelize.transaction();
  try {
    const invoiceNumber = await generateInvoiceNumber();

    let total = 0;
    const saleItemsData = [];

    for (const item of data.items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (!product) {
        const err = new Error(`Barang dengan ID ${item.product_id} tidak ditemukan`);
        err.statusCode = 404;
        throw err;
      }
      if (!product.status) {
        const err = new Error(`Barang ${product.name} tidak aktif`);
        err.statusCode = 400;
        throw err;
      }
      if (product.stock < item.quantity) {
        const err = new Error(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`);
        err.statusCode = 400;
        throw err;
      }

      const sellingPrice = parseFloat(product.selling_price);
      const discount = parseFloat(product.discount || 0);
      const subtotalBeforeDiscount = sellingPrice * item.quantity;
      const discountAmount = discount * item.quantity;
      const subtotal = subtotalBeforeDiscount - discountAmount;

      total += subtotal;

      saleItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        selling_price: sellingPrice,
        discount: discount,
        subtotal: subtotal
      });

      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }

    if (data.paid < total) {
      const err = new Error('Pembayaran kurang dari total transaksi');
      err.statusCode = 400;
      throw err;
    }

    const change = data.paid - total;

    const sale = await Sale.create({
      invoice_number: invoiceNumber,
      user_id: userId,
      total,
      paid: data.paid,
      change
    }, { transaction: t });

    for (const itemData of saleItemsData) {
      await SaleItem.create({ ...itemData, sale_id: sale.id }, { transaction: t });
    }

    await t.commit();

    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }] }
      ]
    });

    return completeSale;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAll = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date);
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (query.start_date) {
    const startDate = new Date(query.start_date);
    where.createdAt = { [Op.gte]: startDate };
  } else if (query.end_date) {
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.lte]: endDate };
  }

  const { count, rows } = await Sale.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      {
        model: SaleItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }]
      }
    ],
    distinct: true,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  const totalPages = Math.ceil(count / limit);

  return {
    sales: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages
    }
  };
};

const getById = async (id) => {
  const sale = await Sale.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      {
        model: SaleItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }]
      }
    ]
  });

  if (!sale) {
    const err = new Error(`Transaksi dengan ID ${id} tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  return sale;
};

module.exports = {
  generateInvoiceNumber,
  create,
  getAll,
  getById
};
