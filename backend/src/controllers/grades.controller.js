const Grade = require('../models/Grade');
const Evaluation = require('../models/Evaluation');
const Course = require('../models/Course');
const { weightedAverage, getSituacion } = require('../utils/gradeCalculator');

async function verifyCourse(courseId, userId) {
  return Course.findOne({ _id: courseId, userId });
}

async function listByCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const grades = await Grade.find({ courseId });
    res.json({ success: true, data: { grades } });
  } catch (err) { next(err); }
}

async function upsertGrade(req, res, next) {
  try {
    const { courseId, studentId, evalId } = req.params;
    const course = await verifyCourse(courseId, req.userId);
    if (!course) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });

    const { status = 'graded', note = '' } = req.body;
    const value = status === 'graded' && req.body.value !== null && req.body.value !== undefined && req.body.value !== ''
      ? Number(req.body.value)
      : null;

    const grade = await Grade.findOneAndUpdate(
      { studentId, evaluationId: evalId },
      { value, status, note, courseId, userId: req.userId },
      { upsert: true, new: true, runValidators: true }
    );

    const [allGrades, evaluations] = await Promise.all([
      Grade.find({ studentId, courseId }),
      Evaluation.find({ courseId })
    ]);

    const avg = weightedAverage(allGrades, evaluations, course.gradeConfig.decimals);
    const situacion = getSituacion(avg, course.gradeConfig.passGrade);

    res.json({ success: true, data: { grade, studentAverage: avg, studentSituacion: situacion } });
  } catch (err) { next(err); }
}

async function batchUpsert(req, res, next) {
  try {
    const { courseId } = req.params;
    const course = await verifyCourse(courseId, req.userId);
    if (!course) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });

    const { grades } = req.body;
    const ops = grades.map(g => ({
      updateOne: {
        filter: { studentId: g.studentId, evaluationId: g.evaluationId },
        update: {
          value: (g.status || 'graded') === 'graded' ? g.value : null,
          status: g.status || 'graded',
          courseId,
          userId: req.userId
        },
        upsert: true
      }
    }));

    await Grade.bulkWrite(ops);
    res.json({ success: true, data: { updated: grades.length } });
  } catch (err) { next(err); }
}

module.exports = { listByCourse, upsertGrade, batchUpsert };
