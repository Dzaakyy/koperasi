const { z } = require('zod');

const createSchema = z.object({
  barcode: z.string().min(1, 'Barcode wajib diisi'),
  name: z.string().min(1, 'Nama barang wajib diisi'),
  category_id: z.number().int().positive('Kategori wajib dipilih'),
  purchase_price: z.number().nonnegative('Harga modal tidak boleh negatif'),
  selling_price: z.number().nonnegative('Harga jual tidak boleh negatif'),
  discount: z.number().nonnegative('Diskon tidak boleh negatif').optional().default(0),
  stock: z.number().int().nonnegative('Stok tidak boleh negatif').optional().default(0),
});

const updateSchema = z.object({
  barcode: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category_id: z.number().int().positive().optional(),
  purchase_price: z.number().nonnegative().optional(),
  selling_price: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  status: z.boolean().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
};
