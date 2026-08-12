const service = require('./service');
const apiResponse = require('../../utils/api');

async function getAll(req, res, next) {
  try {
    const categories = await service.getAll();
    return apiResponse.success(res, 'Data kategori berhasil diambil', categories);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const category = await service.getById(req.params.id);
    return apiResponse.success(res, 'Detail kategori', category);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const category = await service.create(req.body);
    return apiResponse.success(res, 'Kategori berhasil ditambahkan', category, 201);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const category = await service.update(req.params.id, req.body);
    return apiResponse.success(res, 'Kategori berhasil diperbarui', category);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    return apiResponse.success(res, 'Kategori berhasil dihapus');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
