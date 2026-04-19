const Course = require('../models/Course');
const Student = require('../models/Student');
const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const Observation = require('../models/Observation');
const statsService = require('../services/stats.service');

async function list(req, res, next) {
  try {
    const { status, year } = req.query;
    const filter = { userId: req.userId };
    if (status) filter.status = status;
    if (year) filter.academicYear = parseInt(year);

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    const enriched = await Promise.all(courses.map(async c => {
      const [studentCount, evaluationCount] = await Promise.all([
        Student.countDocuments({ courseId: c._id, status: 'active' }),
        Evaluation.countDocuments({ courseId: c._id })
      ]);
      const stats = await statsService.getCourseStats(c._id, c.gradeConfig);
      return { ...c.toObject(), id: c._id, studentCount, evaluationCount, stats };
    }));

    res.json({ success: true, data: { courses: enriched, total: enriched.length } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const body = { ...req.body, userId: req.userId };
    if (!body.schoolId) body.schoolId = null;
    const course = await Course.create(body);
    res.status(201).json({ success: true, data: { course } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, userId: req.userId });
    if (!course) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });
    const stats = await statsService.getCourseStats(course._id, course.gradeConfig);
    res.json({ success: true, data: { course, stats } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const body = { ...req.body };
    if ('schoolId' in body && !body.schoolId) body.schoolId = null;
    const course = await Course.findOneAndUpdate(
      { _id: req.params.courseId, userId: req.userId },
      body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });
    res.json({ success: true, data: { course } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, userId: req.userId });
    if (!course) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });

    const [students, evaluations, grades, observations] = await Promise.all([
      Student.countDocuments({ courseId: course._id }),
      Evaluation.countDocuments({ courseId: course._id }),
      Grade.countDocuments({ courseId: course._id }),
      Observation.countDocuments({ courseId: course._id })
    ]);

    await Promise.all([
      Student.deleteMany({ courseId: course._id }),
      Evaluation.deleteMany({ courseId: course._id }),
      Grade.deleteMany({ courseId: course._id }),
      Observation.deleteMany({ courseId: course._id }),
      course.deleteOne()
    ]);

    res.json({ success: true, data: { message: 'Curso eliminado', deleted: { students, evaluations, grades, observations } } });
  } catch (err) { next(err); }
}

async function duplicate(req, res, next) {
  try {
    const original = await Course.findOne({ _id: req.params.courseId, userId: req.userId });
    if (!original) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });

    const { name, academicYear } = req.body;
    const data = original.toObject();
    delete data._id; delete data.createdAt; delete data.updatedAt; delete data.__v;
    data.name = name || `${data.name} (copia)`;
    if (academicYear) data.academicYear = academicYear;

    const newCourse = await Course.create(data);

    // Copy evaluations (without grades)
    const evals = await Evaluation.find({ courseId: original._id });
    if (evals.length > 0) {
      const newEvals = evals.map(e => {
        const ed = e.toObject();
        delete ed._id; delete ed.createdAt; delete ed.updatedAt; delete ed.__v;
        ed.courseId = newCourse._id;
        return ed;
      });
      await Evaluation.insertMany(newEvals);
    }

    // Copy students (without grades/observations)
    const students = await Student.find({ courseId: original._id });
    if (students.length > 0) {
      const newStudents = students.map(s => {
        const sd = s.toObject();
        delete sd._id; delete sd.createdAt; delete sd.updatedAt; delete sd.__v;
        sd.courseId = newCourse._id;
        return sd;
      });
      await Student.insertMany(newStudents);
    }

    res.status(201).json({ success: true, data: { course: newCourse } });
  } catch (err) { next(err); }
}

async function getStats(req, res, next) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, userId: req.userId });
    if (!course) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Curso no encontrado' } });
    const stats = await statsService.getDetailedStats(course._id, course.gradeConfig);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

module.exports = { list, create, getOne, update, remove, duplicate, getStats };
