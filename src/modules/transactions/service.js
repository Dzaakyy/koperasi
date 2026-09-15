const { Sale, SaleItem, Product, User, StockHistory, sequelize } = require('../../../db/models');
const { Op } = require('sequelize');
const { parseDateRange, getInvoiceDateStringWIB, getStartOfDayWIB } = require('../../utils/date');

const generateInvoiceNumber = async () => {
  const dateStr = getInvoiceDateStringWIB();
  const startOfDay = getStartOfDayWIB();
  const count = await Sale.count({
    where: {
      created_at: {
        [Op.gte]: startOfDay
      }
    }
  }).catch(async () => {
    return await Sale.count();
  });
  return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

const create = async (data, userId) => {
  return await sequelize.transaction(async (t) => {
    const invoiceNumber = await generateInvoiceNumber();

    let validUserId = userId;
    if (!validUserId) {
      const firstUser = await User.findOne({ transaction: t });
      validUserId = firstUser ? firstUser.id : 1;
    }

    let subtotalGross = 0;
    const saleItemsData = [];

    for (const item of (data.items || [])) {
      const productId = Number(item.product_id || item.productId || item.id);
      const quantity = Number(item.quantity || item.qty || 1);

      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) {
        const err = new Error(`Barang dengan ID ${productId} tidak ditemukan di database`);
        err.statusCode = 404;
        throw err;
      }
      if (product.status === false || product.status === 0) {
        const err = new Error(`Barang "${product.name}" sedang tidak aktif`);
        err.statusCode = 400;
        throw err;
      }
      if (product.stock < quantity) {
        const err = new Error(`Stok "${product.name}" tidak mencukupi (tersedia: ${product.stock}, diminta: ${quantity})`);
        err.statusCode = 400;
        throw err;
      }

      const sellingPrice = parseFloat(product.selling_price || product.sellingPrice || 0);
      const discount = parseFloat(product.discount || 0);
      const subtotalBeforeDiscount = sellingPrice * quantity;
      const discountAmount = discount * quantity;
      const itemSubtotal = subtotalBeforeDiscount - discountAmount;

      subtotalGross += itemSubtotal;

      saleItemsData.push({
        product_id: productId,
        quantity: quantity,
        selling_price: sellingPrice,
        discount: discount,
        subtotal: itemSubtotal
      });

      // Kurangi stok barang di database
      await product.update({ stock: product.stock - quantity }, { transaction: t });

      // Catat mutasi keluar di stock_histories
      if (StockHistory) {
        await StockHistory.create({
          product_id: productId,
          user_id: validUserId,
          quantity: -quantity,
          note: `Terjual di Kasir POS (${invoiceNumber})`
        }, { transaction: t }).catch(() => {});
      }
    }

    // 💡 POTONG DISKON TRANSAKSI GLOBAL DARI KASIR
    const transactionDiscount = Number(data.discount || data.discountTotal || data.discount_total || 0);
    const finalTotal = Math.max(0, subtotalGross - transactionDiscount);

    const paid = Number(data.paid ?? data.cash_paid ?? data.cashPaid ?? finalTotal);
    if (paid < finalTotal) {
      const err = new Error(`Pembayaran kurang dari total belanja (Total: ${finalTotal}, Bayar: ${paid})`);
      err.statusCode = 400;
      throw err;
    }

    const change = Math.max(0, paid - finalTotal);
    const paymentMethod = String(data.payment_method || data.paymentMethod || data.payment_type || 'Cash').trim();

    const sale = await Sale.create({
      invoice_number: invoiceNumber,
      user_id: validUserId,
      payment_method: paymentMethod, 
      paymentMethod: paymentMethod,   
      total: finalTotal,
      paid: paid,
      change: change
    }, { transaction: t });

    for (const itemData of saleItemsData) {
      await SaleItem.create({ ...itemData, sale_id: sale.id }, { transaction: t });
    }

    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }] }
      ],
      transaction: t
    });

    return completeSale;
  });
};

const getAll = async (query = {}, user = null) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {};
  const { startDate, endDate } = parseDateRange(query.start_date, query.end_date);

  if (startDate && endDate) {
    where.created_at = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.created_at = { [Op.gte]: startDate };
  } else if (endDate) {
    where.created_at = { [Op.lte]: endDate };
  }

  if (query.payment_method) {
    where.payment_method = query.payment_method;
  }

  const cashierId = query.cashier_id || query.user_id || query.userId;
  if (cashierId) {
    where.user_id = parseInt(cashierId);
  } else if (user && user.role === 'kasir') {
    where.user_id = user.id;
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
    order: [['created_at', 'DESC']],
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
