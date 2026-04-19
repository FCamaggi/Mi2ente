const Observation = require('../models/Observation');
const Course = require('../models/Course');

async function verifyCourse(courseId, userId) {
  return Course.findOne({ _id: courseId, userId });
}

async function list(req, res, next) {
  try {
    const { courseId, studentId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const observations = await Observation.find({ studentId, courseId }).sort({ date: -1 });
    res.json({ success: true, data: { observations } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { courseId, studentId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const observation = await Observation.create({ ...req.body, studentId, courseId, userId: req.userId });
    res.status(201).json({ success: true, data: { observation } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { courseId, studentId, obsId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const observation = await Observation.findOneAndUpdate(
      { _id: obsId, studentId, courseId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!observation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Observación no encontrada' } });
    res.json({ success: true, data: { observation } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { courseId, studentId, obsId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    await Observation.findOneAndDelete({ _id: obsId, studentId, courseId });
    res.json({ success: true, data: { message: 'Observación eliminada' } });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
