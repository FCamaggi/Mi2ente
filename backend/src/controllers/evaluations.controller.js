const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const { decorateEvaluation, getEvaluationGroupTotals } = require('../utils/evaluationWeights');
const { periodExists, sortedPeriods, evaluationsForPeriod } = require('../utils/periods');

async function verifyCourse(courseId, userId) {
  return Course.findOne({ _id: courseId, userId });
}

function normalizePayload(body) {
  const groupName = body.groupName?.trim?.() || '';
  return {
    ...body,
    periodId: body.periodId,
    groupName,
    groupWeight: groupName ? Number(body.groupWeight) : null,
    weight: Number(body.weight)
  };
}

function normalizeGroupItem(item) {
  const name = item.name?.trim?.() || '';
  const groupName = item.groupName?.trim?.() || '';
  return {
    _id: item._id || item.id,
    name,
    type: item.type || 'prueba',
    weight: Number(item.weight),
    groupName,
    groupWeight: groupName ? Number(item.groupWeight) : null,
    date: item.date || null,
    description: item.description?.trim?.() || ''
  };
}

async function list(req, res, next) {
  try {
    const { courseId } = req.params;
    const course = await verifyCourse(courseId, req.userId);
    if (!course) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }

    const evaluations = await Evaluation.find({ courseId }).sort({ order: 1 });
    const decorated = evaluations.map(decorateEvaluation);
    const periods = sortedPeriods(course);
    const firstPeriodId = periods[0]?._id;
    const totalsByPeriod = periods.map((period) => {
      const items = evaluationsForPeriod(decorated, period._id, firstPeriodId);
      const totalWeight = getEvaluationGroupTotals(items);
      return { periodId: period._id, totalWeight, weightValid: Math.abs(totalWeight - 100) < 0.1 };
    });
    const requested = req.query.periodId
      ? totalsByPeriod.find((item) => item.periodId.toString() === req.query.periodId)
      : totalsByPeriod[0];

    res.json({
      success: true,
      data: {
        evaluations: decorated,
        totalWeight: requested?.totalWeight ?? 0,
        weightValid: requested?.weightValid ?? false,
        totalsByPeriod
      }
    });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { courseId } = req.params;
    const course = await verifyCourse(courseId, req.userId);
    if (!course) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    if (!periodExists(course, req.body.periodId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PERIOD', message: 'El período no pertenece al curso' } });
    }
    const count = await Evaluation.countDocuments({ courseId, periodId: req.body.periodId });
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
    const course = await verifyCourse(courseId, req.userId);
    if (!course) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    if (!periodExists(course, req.body.periodId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PERIOD', message: 'El período no pertenece al curso' } });
    }
    const existingEvaluation = await Evaluation.findOne({ _id: evalId, courseId });
    const evaluation = await Evaluation.findOneAndUpdate(
      { _id: evalId, courseId },
      normalizePayload(req.body),
      { new: true, runValidators: true }
    );
    if (!evaluation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Evaluación no encontrada' } });
    if (existingEvaluation?.groupName && existingEvaluation.periodId?.toString() !== req.body.periodId?.toString()) {
      await Evaluation.updateMany(
        { courseId, periodId: existingEvaluation.periodId, groupName: existingEvaluation.groupName },
        { periodId: req.body.periodId }
      );
    }
    res.json({ success: true, data: { evaluation: decorateEvaluation(evaluation) } });
  } catch (err) { next(err); }
}

async function updateGroup(req, res, next) {
  const session = await mongoose.startSession();

  try {
    const { courseId } = req.params;
    const course = await verifyCourse(courseId, req.userId);
    if (!course) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }

    const originalName = req.body.groupNameOriginal?.trim?.() || '';
    const groupName = req.body.groupName?.trim?.() || '';
    const groupWeight = Number(req.body.groupWeight);
    const periodId = req.body.periodId;
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!originalName || !groupName) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'El nombre del grupo es requerido' } });
    }
    if (!periodExists(course, periodId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PERIOD', message: 'El período no pertenece al curso' } });
    }
    if (Number.isNaN(groupWeight) || groupWeight < 0 || groupWeight > 100) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'La ponderación del grupo debe estar entre 0 y 100' } });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'El grupo debe tener al menos una evaluación' } });
    }

    const normalizedItems = items.map((item) => normalizeGroupItem({ ...item, groupName, groupWeight }));
    const invalidItem = normalizedItems.find((item) =>
      !item.name || Number.isNaN(item.weight) || item.weight < 0 || item.weight > 100
    );
    if (invalidItem) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cada evaluación debe tener nombre y ponderación válida' } });
    }

    let decorated = [];

    await session.withTransaction(async () => {
      const originalPeriodId = req.body.periodIdOriginal || periodId;
      const existing = await Evaluation.find({ courseId, userId: req.userId, periodId: originalPeriodId, groupName: originalName }).session(session);
      const existingIds = new Set(existing.map((evaluation) => evaluation._id.toString()));
      const payloadIds = new Set(normalizedItems.filter((item) => item._id).map((item) => item._id.toString()));
      const omitted = existing.filter((evaluation) => !payloadIds.has(evaluation._id.toString()));

      if (omitted.length > 0) {
        const omittedIds = omitted.map((evaluation) => evaluation._id);
        const gradeCount = await Grade.countDocuments({ courseId, evaluationId: { $in: omittedIds } }).session(session);
        if (gradeCount > 0) {
          const err = new Error('No se puede quitar una evaluación del grupo porque tiene notas asociadas');
          err.status = 409;
          err.code = 'GROUP_EVALUATION_HAS_GRADES';
          throw err;
        }
        await Evaluation.deleteMany({ _id: { $in: omittedIds }, courseId }).session(session);
      }

      const saved = [];
      for (let index = 0; index < normalizedItems.length; index += 1) {
        const item = normalizedItems[index];
        const payload = {
          name: item.name,
          type: item.type,
          weight: item.weight,
          groupName,
          groupWeight,
          periodId,
          date: item.date,
          description: item.description,
          order: index
        };

        if (item._id) {
          if (!existingIds.has(item._id.toString())) {
            const err = new Error('Una evaluación no pertenece al grupo original');
            err.status = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
          }
          const updated = await Evaluation.findOneAndUpdate(
            { _id: item._id, courseId, userId: req.userId },
            payload,
            { new: true, runValidators: true, session }
          );
          if (updated) saved.push(updated);
        } else {
          const created = await Evaluation.create([{
            ...payload,
            courseId,
            userId: req.userId
          }], { session });
          saved.push(created[0]);
        }
      }

      decorated = saved.map(decorateEvaluation);
    });

    res.json({ success: true, data: { evaluations: decorated } });
  } catch (err) {
    if (err.status === 409 || err.code === 'GROUP_EVALUATION_HAS_GRADES') {
      return res.status(409).json({ success: false, error: { code: 'GROUP_EVALUATION_HAS_GRADES', message: err.message } });
    }
    next(err);
  } finally {
    session.endSession();
  }
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

module.exports = { list, create, update, updateGroup, reorder, remove };
