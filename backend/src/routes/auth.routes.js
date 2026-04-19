const router = require('express').Router();
const { authLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authValidators } = require('../utils/validators');

router.post('/register', authLimiter, authValidators.register, validate, ctrl.register);
router.post('/login', authLimiter, authValidators.login, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', verifyToken, ctrl.logout);
router.post('/forgot-password', authValidators.forgotPassword, validate, ctrl.forgotPassword);
router.post('/reset-password/:token', authValidators.resetPassword, validate, ctrl.resetPassword);

module.exports = router;
