const service = require('./service');
const apiResponse = require('../../utils/api');

class Controller {
  static async create(req, res, next) {
    try {
      const sale = await service.create(req.body, req.user.id);
      return apiResponse.success(res, 'Transaksi berhasil', sale, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await service.getAll(req.query);
      return apiResponse.pagination(res, 'Data transaksi berhasil diambil', result.sales, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const sale = await service.getById(req.params.id);
      return apiResponse.success(res, 'Detail transaksi', sale);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
