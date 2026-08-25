const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error";

  res.status(statusCode).json({
    error: message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

export { errorHandler, notFound };
