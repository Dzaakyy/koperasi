const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['admin', 'kasir']).optional().default('kasir')
});

const updateSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  role: z.enum(['admin', 'kasir']).optional(),
  status: z.boolean().optional()
});

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password minimal 6 karakter')
});

module.exports = {
  createSchema,
  updateSchema,
  changePasswordSchema
};
