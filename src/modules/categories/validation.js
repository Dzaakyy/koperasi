const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi')
});

const updateSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi')
});

module.exports = {
  createSchema,
  updateSchema
};
