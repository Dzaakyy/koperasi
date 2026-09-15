const { Sale, SaleItem, Product, StockHistory, User, sequelize, Sequelize } = require('../../../db/models');
const { Op } = require('sequelize');
const { parseDateRange, getStartOfDayWIB, getStartOfMonthWIB } = require('../../utils/date');

const getSalesReport = async (query = {}) => {
  const where = {};
  const { startDate, endDate } = parseDateRange(query.start_date, query.end_date);

  if (startDate && endDate) {
    where.created_at = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.created_at = { [Op.gte]: startDate };
  } else if (endDate) {
    where.created_at = { [Op.lte]: endDate };
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
    order: [['created_at', 'DESC']]
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
  const { startDate, endDate } = parseDateRange(query.start_date, query.end_date);

  if (startDate && endDate) {
    where.created_at = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.created_at = { [Op.gte]: startDate };
  } else if (endDate) {
    where.created_at = { [Op.lte]: endDate };
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
    order: [['created_at', 'DESC']]
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
  const { startDate, endDate } = parseDateRange(query.start_date, query.end_date);

  if (startDate && endDate) {
    saleWhere.created_at = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    saleWhere.created_at = { [Op.gte]: startDate };
  } else if (endDate) {
    saleWhere.created_at = { [Op.lte]: endDate };
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
        attributes: ['id', 'created_at']
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

const getActivities = async (query = {}) => {
  const limit = parseInt(query.limit) || 30;

  const recentSales = await Sale.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'username', 'role'] },
      {
        model: SaleItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] }]
      }
    ],
    order: [['created_at', 'DESC']],
    limit
  });

  const recentStocks = await StockHistory.findAll({
    include: [
      { model: Product, as: 'product', attributes: ['id', 'barcode', 'name'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'username', 'role'] }
    ],
    order: [['created_at', 'DESC']],
    limit
  });

  const activities = [];

  for (const sale of recentSales) {
    const itemCount = sale.items ? sale.items.reduce((acc, it) => acc + (it.quantity || 0), 0) : 0;
    const timeVal = sale.created_at || sale.createdAt;
    activities.push({
      id: `sale-${sale.id}`,
      type: 'TRANSACTION',
      title: `Transaksi ${sale.invoice_number}`,
      description: `${sale.user?.name || 'Kasir'} melayani penjualan ${itemCount} barang (Rp ${Number(sale.total).toLocaleString('id-ID')})`,
      amount: parseFloat(sale.total || 0),
      payment_method: sale.payment_method,
      user: sale.user,
      items: sale.items,
      created_at: timeVal,
      timestamp: timeVal ? new Date(timeVal).getTime() : Date.now()
    });
  }

  for (const stock of recentStocks) {
    const isAdded = (stock.quantity || 0) > 0;
    const timeVal = stock.created_at || stock.createdAt;
    activities.push({
      id: `stock-${stock.id}`,
      type: isAdded ? 'STOCK_IN' : 'STOCK_OUT',
      title: isAdded ? `Stok Masuk: ${stock.product?.name || 'Barang'}` : `Stok Keluar: ${stock.product?.name || 'Barang'}`,
      description: `${stock.user?.name || 'Pengguna'} mencatat ${isAdded ? '+' : ''}${stock.quantity} pcs (${stock.note || '-'})`,
      quantity: stock.quantity,
      product: stock.product,
      user: stock.user,
      note: stock.note,
      created_at: timeVal,
      timestamp: timeVal ? new Date(timeVal).getTime() : Date.now()
    });
  }

  activities.sort((a, b) => b.timestamp - a.timestamp);

  return {
    activities: activities.slice(0, limit),
    total: activities.length
  };
};

const getDashboardSummary = async () => {
  const startOfDay = getStartOfDayWIB();
  const startOfMonth = getStartOfMonthWIB();

  const todaySales = await Sale.findAll({
    where: {
      created_at: { [Op.gte]: startOfDay }
    },
    include: [{ model: SaleItem, as: 'items' }]
  });

  const todayRevenue = todaySales.reduce((acc, s) => acc + parseFloat(s.total || 0), 0);
  const todayTransactions = todaySales.length;

  const monthSales = await Sale.findAll({
    where: {
      created_at: { [Op.gte]: startOfMonth }
    }
  });
  const monthRevenue = monthSales.reduce((acc, s) => acc + parseFloat(s.total || 0), 0);

  const totalProducts = await Product.count();
  const lowStockProducts = await Product.count({ where: { stock: { [Op.lte]: 5 } } });

  return {
    today: {
      revenue: todayRevenue,
      transactions: todayTransactions,
      items: todaySales.reduce((acc, s) => acc + (s.items ? s.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0), 0)
    },
    month: {
      revenue: monthRevenue,
      transactions: monthSales.length
    },
    products: {
      total: totalProducts,
      lowStock: lowStockProducts
    }
  };
};

module.exports = {
  getSalesReport,
  getStockReport,
  getProfitReport,
  getActivities,
  getDashboardSummary
};
