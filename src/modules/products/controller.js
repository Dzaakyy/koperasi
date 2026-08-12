const productService = require('./service');
const apiResponse = require('../../utils/api');

const getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    return apiResponse.pagination(res, 'Data barang berhasil diambil', result.products, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    return apiResponse.success(res, 'Detail barang', product);
  } catch (error) {
    next(error);
  }
};

const getByBarcode = async (req, res, next) => {
  try {
    const product = await productService.getByBarcode(req.params.barcode);
    return apiResponse.success(res, 'Barang ditemukan', product);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    return apiResponse.success(res, 'Barang berhasil ditambahkan', product, 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    return apiResponse.success(res, 'Barang berhasil diperbarui', product);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    return apiResponse.success(res, 'Barang berhasil dinonaktifkan');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getByBarcode,
  create,
  update,
  remove,
};
