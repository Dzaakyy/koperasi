const success = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

const validationError = (res, message = 'Validasi gagal', errors = {}) => {
  return res.status(422).json({
    success: false,
    message,
    errors
  });
};

const pagination = (res, message, data, paginationInfo) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: paginationInfo
  });
};

module.exports = {
  success,
  error,
  validationError,
  pagination
};
