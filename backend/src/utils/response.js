export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
