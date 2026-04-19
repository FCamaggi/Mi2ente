function errorHandler(err, req, res, next) {
  console.error(err);

  if (Array.isArray(err?.details)) {
    return res.status(err.status || 400).json({
      success: false,
      error: {
        code: err.code || 'VALIDATION_ERROR',
        message: err.message || 'Datos inválidos',
        details: err.details
      }
    });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details }
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: `Ya existe un registro con ese ${field}` }
    });
  }

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: err.message }
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message: err.message || 'Error interno del servidor' }
  });
}

module.exports = errorHandler;
