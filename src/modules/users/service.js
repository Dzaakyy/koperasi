const { User } = require('../../../db/models');
const { hashPassword } = require('../../utils/bcrypt');
const { Op } = require('sequelize');

async function getAll(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = query.search || '';

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { username: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']]
  });

  const totalPages = Math.ceil(count / limit);

  return {
    users: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages
    }
  };
}

async function getById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

async function create(data) {
  const existing = await User.findOne({ where: { username: data.username } });
  if (existing) {
    const err = new Error('Username sudah digunakan');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(data.password);
  const newUser = await User.create({
    ...data,
    password: hashedPassword
  });

  return await getById(newUser.id);
}

async function update(id, data) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (data.username && data.username !== user.username) {
    const existing = await User.findOne({ where: { username: data.username } });
    if (existing) {
      const err = new Error('Username sudah digunakan');
      err.statusCode = 409;
      throw err;
    }
  }

  const updateData = { ...data };
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  await user.update(updateData);

  return await getById(id);
}

async function changePassword(id, password) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  await user.update({ password: hashedPassword });

  return await getById(id);
}

async function remove(id) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'admin') {
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      const err = new Error('Tidak dapat menghapus satu-satunya Admin');
      err.statusCode = 400;
      throw err;
    }
  }

  await user.destroy();
  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  changePassword,
  remove
};
