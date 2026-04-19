const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const { decorateEvaluation, getEvaluationGroupTotals } = require('../utils/evaluationWeights');

async function verifyCourse(courseId, userId) {
  return Course.findOne({ _id: courseId, userId });
}

function normalizePayload(body) {
  const groupName = body.groupName?.trim?.() || '';
  return {
    ...body,
    groupName,
    groupWeight: groupName ? Number(body.groupWeight) : null,
    weight: Number(body.weight)
  };
}

async function list(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }

    const evaluations = await Evaluation.find({ courseId }).sort({ order: 1 });
    const decorated = evaluations.map(decorateEvaluation);
    const totalWeight = getEvaluationGroupTotals(decorated);

    res.json({
      success: true,
      data: {
        evaluations: decorated,
        totalWeight,
        weightValid: Math.abs(totalWeight - 100) < 0.1
      }
    });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const count = await Evaluation.countDocuments({ courseId });
    const evaluation = await Evaluation.create({
      ...normalizePayload(req.body),
      courseId,
      userId: req.userId,
      order: count
    });
    res.status(201).json({ success: true, data: { evaluation: decorateEvaluation(evaluation) } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { courseId, evalId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const evaluation = await Evaluation.findOneAndUpdate(
      { _id: evalId, courseId },
      normalizePayload(req.body),
      { new: true, runValidators: true }
    );
    if (!evaluation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evaluación no encontrada' } });
    res.json({ success: true, data: { evaluation: decorateEvaluation(evaluation) } });
  } catch (err) { next(err); }
}

async function reorder(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const { order } = req.body;
    await Promise.all(order.map((id, idx) => Evaluation.findByIdAndUpdate(id, { order: idx })));
    res.json({ success: true, data: { message: 'Reordenado' } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { courseId, evalId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    await Promise.all([
      Grade.deleteMany({ evaluationId: evalId }),
      Evaluation.findOneAndDelete({ _id: evalId, courseId })
    ]);
    res.json({ success: true, data: { message: 'Evaluación eliminada' } });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, reorder, remove };
