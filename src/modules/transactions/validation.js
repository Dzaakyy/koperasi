const { z } = require('zod');

const createSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.number().int().positive('Product ID wajib'),
      quantity: z.number().int().positive('Jumlah harus lebih dari 0')
    })
  ).min(1, 'Minimal satu barang harus ditambahkan'),
  paid: z.number().positive('Jumlah pembayaran harus lebih dari 0')
});

module.exports = {
  createSchema
};
