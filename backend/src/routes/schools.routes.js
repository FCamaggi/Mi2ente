const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const schoolsCtrl = require('../controllers/schools.controller');

router.use(verifyToken);

router.get('/', schoolsCtrl.list);
router.post('/', schoolsCtrl.create);
router.put('/:schoolId', schoolsCtrl.update);
router.delete('/:schoolId', schoolsCtrl.remove);

module.exports = router;
