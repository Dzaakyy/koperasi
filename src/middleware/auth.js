const { verifyToken } = require('../utils/jwt');

const auth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau telah kedaluwarsa'
      });
    }

    let User;
    try {
      const db = require('../../db/models');
      User = db.User;
    } catch (err) {
      User = null;
    }

    let user = null;
    if (User) {
      user = await User.findByPk(decoded.id);
    } else {
      user = decoded;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    if (user.status === false) {
      return res.status(401).json({
        success: false,
        message: 'Akun pengguna tidak aktif'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
