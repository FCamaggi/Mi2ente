const router = require('express').Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const coursesCtrl = require('../controllers/courses.controller');
const studentsCtrl = require('../controllers/students.controller');
const evalsCtrl = require('../controllers/evaluations.controller');
const gradesCtrl = require('../controllers/grades.controller');
const obsCtrl = require('../controllers/observations.controller');
const exportService = require('../services/export.service');
const Course = require('../models/Course');
const validate = require('../middleware/validate');
const { courseValidators, studentValidators, gradeValidators, evaluationValidators } = require('../utils/validators');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    if (!file.mimetype || allowedTypes.includes(file.mimetype)) return cb(null, true);
    const error = new Error('El archivo debe ser .xlsx, .xls o .csv');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'file', message: error.message }];
    return cb(error);
  }
});

router.use(verifyToken);

// Courses
router.get('/', coursesCtrl.list);
router.post('/', courseValidators.createOrUpdate, validate, coursesCtrl.create);
router.get('/:courseId', coursesCtrl.getOne);
router.put('/:courseId', courseValidators.createOrUpdate, validate, coursesCtrl.update);
router.patch('/:courseId', courseValidators.createOrUpdate, validate, coursesCtrl.update);
router.delete('/:courseId', coursesCtrl.remove);
router.post('/:courseId/duplicate', coursesCtrl.duplicate);
router.get('/:courseId/stats', coursesCtrl.getStats);

// Export
router.get('/:courseId/export/excel', async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, userId: req.userId });
    if (!course) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });
    const buffer = await exportService.toExcel(req.params.courseId, course);
    const safeName = course.name.replace(/[^a-z0-9]/gi, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_${course.academicYear}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) { next(err); }
});

// Students
router.get('/:courseId/students', studentsCtrl.list);
router.post('/:courseId/students', studentValidators.createOrUpdate, validate, studentsCtrl.create);
router.post('/:courseId/students/import', upload.single('file'), studentValidators.importFile, validate, studentsCtrl.importStudents);
router.get('/:courseId/students/:studentId', studentsCtrl.getOne);
router.put('/:courseId/students/:studentId', studentValidators.createOrUpdate, validate, studentsCtrl.update);
router.delete('/:courseId/students/:studentId', studentsCtrl.remove);

// Evaluations
router.get('/:courseId/evaluations', evalsCtrl.list);
router.post('/:courseId/evaluations', evaluationValidators.createOrUpdate, validate, evalsCtrl.create);
router.patch('/:courseId/evaluations/reorder', evalsCtrl.reorder);
router.put('/:courseId/evaluations/:evalId', evaluationValidators.createOrUpdate, validate, evalsCtrl.update);
router.delete('/:courseId/evaluations/:evalId', evalsCtrl.remove);

// Grades
router.get('/:courseId/grades', gradesCtrl.listByCourse);
router.put('/:courseId/grades/:studentId/:evalId', gradeValidators.upsert, validate, gradesCtrl.upsertGrade);
router.post('/:courseId/grades/batch', gradesCtrl.batchUpsert);

// Observations
router.get('/:courseId/students/:studentId/observations', obsCtrl.list);
router.post('/:courseId/students/:studentId/observations', obsCtrl.create);
router.put('/:courseId/students/:studentId/observations/:obsId', obsCtrl.update);
router.delete('/:courseId/students/:studentId/observations/:obsId', obsCtrl.remove);

module.exports = router;
