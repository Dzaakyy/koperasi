const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const formattedErrors = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.') || 'general';
      formattedErrors[field] = e.message;
    });

    return res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: formattedErrors
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
