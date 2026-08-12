const stockService = require('./service');
const apiResponse = require('../../utils/api');

const addStock = async (req, res, next) => {
  try {
    const result = await stockService.addStock(req.body, req.user.id);
    return apiResponse.success(res, 'Stok berhasil ditambahkan', result, 201);
  } catch (error) {
    next(error);
  }
};

const getHistories = async (req, res, next) => {
  try {
    const result = await stockService.getHistories(req.query);
    return apiResponse.pagination(res, 'Riwayat stok berhasil diambil', result.histories, result.pagination);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addStock,
  getHistories,
};
