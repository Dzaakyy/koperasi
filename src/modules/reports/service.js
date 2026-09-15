const { Sale, SaleItem, Product, StockHistory, User, sequelize, Sequelize } = require('../../../db/models');
const { Op } = require('sequelize');

const getSalesReport = async (query = {}) => {
  const where = {};
  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (query.start_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: startDate };
  } else if (query.end_date) {
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.lte]: endDate };
  }

  const sales = await Sale.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      {
        model: SaleItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  let totalItemsSold = 0;
  let totalRevenue = 0;

  for (const sale of sales) {
    totalRevenue += parseFloat(sale.total || 0);
    if (sale.items && Array.isArray(sale.items)) {
      for (const item of sale.items) {
        totalItemsSold += item.quantity || 0;
      }
    }
  }

  return {
    sales,
    summary: {
      totalTransactions: sales.length,
      totalItemsSold,
      totalRevenue
    }
  };
};

const getStockReport = async (query = {}) => {
  const where = {};
  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (query.start_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: startDate };
  } else if (query.end_date) {
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { [Op.lte]: endDate };
  }

  if (query.product_id) {
    where.product_id = query.product_id;
  }

  const histories = await StockHistory.findAll({
    where,
    include: [
      { model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] },
      { model: User, as: 'user', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  let totalStockAdded = 0;
  for (const history of histories) {
    totalStockAdded += history.quantity || 0;
  }

  return {
    histories,
    summary: {
      totalEntries: histories.length,
      totalStockAdded
    }
  };
};

const getProfitReport = async (query = {}) => {
  const saleWhere = {};
  if (query.start_date && query.end_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    saleWhere.createdAt = { [Op.between]: [startDate, endDate] };
  } else if (query.start_date) {
    const startDate = new Date(query.start_date);
    startDate.setHours(0, 0, 0, 0);
    saleWhere.createdAt = { [Op.gte]: startDate };
  } else if (query.end_date) {
    const endDate = new Date(query.end_date);
    endDate.setHours(23, 59, 59, 999);
    saleWhere.createdAt = { [Op.lte]: endDate };
  }

  const saleItems = await SaleItem.findAll({
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'purchase_price', 'selling_price']
      },
      {
        model: Sale,
        as: 'sale',
        where: saleWhere,
        required: true,
        attributes: ['id', 'createdAt']
      }
    ]
  });

  const grouped = {};

  for (const item of saleItems) {
    const productId = item.product_id;
    const quantity = item.quantity || 0;
    const subtotal = parseFloat(item.subtotal || 0);
    const purchasePrice = item.product ? parseFloat(item.product.purchase_price || 0) : 0;
    const sellingPrice = parseFloat(item.selling_price || 0);
    const productName = item.product ? item.product.name : 'Unknown';

    if (!grouped[productId]) {
      grouped[productId] = {
        productId,
        productName,
        purchasePrice,
        sellingPrice,
        totalSold: 0,
        totalCost: 0,
        totalSales: 0,
        estimatedProfit: 0
      };
    }

    grouped[productId].totalSold += quantity;
    grouped[productId].totalSales += subtotal;
  }

  let grandTotalCost = 0;
  let grandTotalSales = 0;
  let grandTotalProfit = 0;

  const productsList = Object.values(grouped).map((p) => {
    p.totalCost = p.purchasePrice * p.totalSold;
    p.estimatedProfit = p.totalSales - p.totalCost;

    grandTotalCost += p.totalCost;
    grandTotalSales += p.totalSales;
    grandTotalProfit += p.estimatedProfit;

    return p;
  });

  return {
    products: productsList,
    summary: {
      totalCost: grandTotalCost,
      totalSales: grandTotalSales,
      totalProfit: grandTotalProfit
    }
  };
};

module.exports = {
  getSalesReport,
  getStockReport,
  getProfitReport
};
