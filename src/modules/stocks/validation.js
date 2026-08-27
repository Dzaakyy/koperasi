const { z } = require('zod');

const addStockSchema = z.object({
  product_id: z.number().int().positive('Barang wajib dipilih'),
  quantity: z.number().int().positive('Jumlah stok harus lebih dari 0'),
  note: z.string().optional().default(''),
});

const reduceStockSchema = z.object({
  product_id: z.number().int().positive('Barang wajib dipilih'),
  quantity: z.number().int().positive('Jumlah stok harus lebih dari 0'),
  note: z.string().optional().default('Pengeluaran Stok Manual'),
});

module.exports = {
  addStockSchema,
  reduceStockSchema,
};
