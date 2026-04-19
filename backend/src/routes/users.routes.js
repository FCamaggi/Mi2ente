const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

router.use(verifyToken);
router.get('/me', ctrl.getMe);
router.patch('/me', ctrl.updateMe);
router.patch('/me/password', ctrl.changePassword);

module.exports = router;
