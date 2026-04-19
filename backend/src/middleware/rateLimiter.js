const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Intenta en un minuto.' } }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Intenta en 15 minutos.' } }
});

module.exports = { generalLimiter, authLimiter };
