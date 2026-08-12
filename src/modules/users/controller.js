const service = require('./service');
const apiResponse = require('../../utils/api');

class Controller {
  static async getAll(req, res, next) {
    try {
      const result = await service.getAll(req.query);
      return apiResponse.pagination(res, 'Data pengguna berhasil diambil', result.users, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await service.getById(req.params.id);
      return apiResponse.success(res, 'Detail pengguna', user);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const user = await service.create(req.body);
      return apiResponse.success(res, 'Pengguna berhasil ditambahkan', user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const user = await service.update(req.params.id, req.body);
      return apiResponse.success(res, 'Pengguna berhasil diperbarui', user);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      await service.changePassword(req.params.id, req.body.password);
      return apiResponse.success(res, 'Password berhasil diubah');
    } catch (error) {
      next(error);
    }
  }

  static async remove(req, res, next) {
    try {
      await service.remove(req.params.id);
      return apiResponse.success(res, 'Pengguna berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
