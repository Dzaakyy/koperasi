const service = require('./service');
const apiResponse = require('../../utils/api');

const getSalesReport = async (req, res, next) => {
  try {
    const result = await service.getSalesReport(req.query);
    return apiResponse.success(res, 'Laporan penjualan', result);
  } catch (error) {
    next(error);
  }
};

const getStockReport = async (req, res, next) => {
  try {
    const result = await service.getStockReport(req.query);
    return apiResponse.success(res, 'Laporan penambahan stok', result);
  } catch (error) {
    next(error);
  }
};

const getProfitReport = async (req, res, next) => {
  try {
    const result = await service.getProfitReport(req.query);
    return apiResponse.success(res, 'Laporan perkiraan laba', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getStockReport,
  getProfitReport
};
