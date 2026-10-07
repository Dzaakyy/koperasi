const stockService = require('./service');
const apiResponse = require('../../utils/api');

class Controller {
  static async addStock(req, res, next) {
    try {
      const result = await stockService.addStock(req.body, req.user.id);
      return apiResponse.success(res, 'Stok berhasil ditambahkan', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async reduceStock(req, res, next) {
    try {
      const result = await stockService.reduceStock(req.body, req.user.id);
      return apiResponse.success(res, 'Barang keluar berhasil dicatat', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getHistories(req, res, next) {
    try {
      const result = await stockService.getHistories(req.query);
      return apiResponse.pagination(res, 'Riwayat stok berhasil diambil', result.histories, result.pagination);
    } catch (error) {
      next(error);
    }
  }
  static async deleteHistory(req, res, next) {
    try {
      await stockService.deleteHistory(req.params.id);
      return apiResponse.success(res, 'Riwayat mutasi stok berhasil dihapus dan stok dikembalikan');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
