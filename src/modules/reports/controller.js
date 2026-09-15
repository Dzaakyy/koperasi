const service = require('./service');
const apiResponse = require('../../utils/api');

class Controller {
  static async getSalesReport(req, res, next) {
    try {
      const result = await service.getSalesReport(req.query);
      return apiResponse.success(res, 'Laporan penjualan', result);
    } catch (error) {
      next(error);
    }
  }

  static async getStockReport(req, res, next) {
    try {
      const result = await service.getStockReport(req.query);
      return apiResponse.success(res, 'Laporan penambahan stok', result);
    } catch (error) {
      next(error);
    }
  }

  static async getProfitReport(req, res, next) {
    try {
      const result = await service.getProfitReport(req.query);
      return apiResponse.success(res, 'Laporan perkiraan laba', result);
    } catch (error) {
      next(error);
    }
  }

  static async getActivities(req, res, next) {
    try {
      const result = await service.getActivities(req.query);
      return apiResponse.success(res, 'Seluruh aktivitas sistem berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardSummary(req, res, next) {
    try {
      const result = await service.getDashboardSummary();
      return apiResponse.success(res, 'Ringkasan dashboard berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
