const { User } = require('../../../db/models');
const { comparePassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/jwt');

async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    const err = new Error('Username atau password salah');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === false) {
    const err = new Error('Akun Anda tidak aktif');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error('Username atau password salah');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  };
}

module.exports = {
  login
};
