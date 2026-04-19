const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    }
  });
}

module.exports = validate;
