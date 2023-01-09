module.exports = (res, message = '', statusCode = 500, data = {}) => {
  const statusMessage = `${statusCode}`.startsWith(4) ? 'fail' : 'success';
  return res.status(statusCode).json({
    status: statusMessage,
    message,
    length: data.length,
    data,
  });
};
