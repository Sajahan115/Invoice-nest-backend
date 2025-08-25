export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Default values
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  // Handle Joi validation errors
  if (err.isJoi) {
    status = 400;
    message = err.details?.[0]?.message || "Validation error";
  }

  // Handle unauthorized errors (e.g., JWT)
  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid or expired token";
  }

  // Handle forbidden errors
  if (err.status === 403) {
    message = "Forbidden";
  }

  // Handle not found errors
  if (err.status === 404) {
    message = err.message || "Resource not found";
  }

  res.status(status).json({
    status,
    message,
    error: err.stack,
  });
};
