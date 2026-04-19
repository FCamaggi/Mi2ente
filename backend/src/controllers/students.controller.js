const path = require('path');
const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Observation = require('../models/Observation');
const Evaluation = require('../models/Evaluation');
const Course = require('../models/Course');
const { weightedAverage, getSituacion } = require('../utils/gradeCalculator');
const { getEffectiveWeight } = require('../utils/evaluationWeights');

async function verifyCourse(courseId, userId) {
  const course = await Course.findOne({ _id: courseId, userId });
  return course;
}

async function list(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }

    const students = await Student.find({ courseId, status: 'active' }).sort({ listNumber: 1 });
    const evaluations = await Evaluation.find({ courseId }).sort({ order: 1 });
    const grades = await Grade.find({ courseId });
    const course = await Course.findById(courseId);
    const { passGrade, decimals } = course.gradeConfig;

    const enriched = students.map((s) => {
      const sg = grades.filter((g) => g.studentId.toString() === s._id.toString());
      const avg = weightedAverage(sg, evaluations, decimals);
      return {
        id: s._id,
        listNumber: s.listNumber,
        lastName: s.lastName,
        firstName: s.firstName,
        fullName: `${s.lastName} ${s.firstName}`,
        status: s.status,
        average: avg,
        situacion: getSituacion(avg, passGrade)
      };
    });

    res.json({ success: true, data: { students: enriched, total: enriched.length } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    if (Array.isArray(req.body.students) && req.body.students.length > 0) {
      const invalidStudent = req.body.students.find((student) =>
        !student.lastName?.trim?.() || !student.firstName?.trim?.() || !Number.isInteger(Number(student.listNumber)) || Number(student.listNumber) < 1
      );
      if (invalidStudent) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cada alumno debe incluir número de lista, apellido y nombre válidos' } });
      }
      const students = await Student.insertMany(
        req.body.students.map((student) => ({ ...student, courseId, userId: req.userId })),
        { ordered: true }
      );
      return res.status(201).json({ success: true, data: { students, created: students.length } });
    }

    const student = await Student.create({ ...req.body, courseId, userId: req.userId });
    res.status(201).json({ success: true, data: { student, created: 1 } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const { courseId, studentId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }

    const [student, evaluations, grades, observations, course] = await Promise.all([
      Student.findOne({ _id: studentId, courseId }),
      Evaluation.find({ courseId }).sort({ order: 1 }),
      Grade.find({ studentId, courseId }),
      Observation.find({ studentId, courseId }).sort({ date: -1 }),
      Course.findById(courseId)
    ]);

    if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alumno no encontrado' } });

    const { passGrade, decimals } = course.gradeConfig;
    const avg = weightedAverage(grades, evaluations, decimals);

    const gradesList = evaluations.map((ev) => {
      const g = grades.find((gr) => gr.evaluationId.toString() === ev._id.toString());
      return {
        evaluationId: ev._id,
        evaluationName: ev.name,
        weight: ev.weight,
        effectiveWeight: getEffectiveWeight(ev),
        groupName: ev.groupName || '',
        groupWeight: ev.groupWeight ?? null,
        value: g?.value ?? null,
        status: g?.status ?? 'pending'
      };
    });

    res.json({
      success: true,
      data: {
        student,
        grades: gradesList,
        average: avg,
        situacion: getSituacion(avg, passGrade),
        observations
      }
    });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { courseId, studentId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const student = await Student.findOneAndUpdate(
      { _id: studentId, courseId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alumno no encontrado' } });
    res.json({ success: true, data: { student } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { courseId, studentId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    await Promise.all([
      Grade.deleteMany({ studentId }),
      Observation.deleteMany({ studentId }),
      Student.findOneAndDelete({ _id: studentId, courseId })
    ]);
    res.json({ success: true, data: { message: 'Alumno eliminado' } });
  } catch (err) { next(err); }
}

async function importStudents(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!await verifyCourse(courseId, req.userId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Archivo requerido' } });

    const allRows = [];
    const ext = path.extname(req.file.originalname || '').toLowerCase();

    if (ext === '.csv' || req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/csv') {
      const lines = req.file.buffer
        .toString('utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      lines.forEach((line) => {
        allRows.push(line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
      });
    } else {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Archivo vacío o inválido' } });

      worksheet.eachRow({ includeEmpty: false }, (row) => {
        allRows.push(row.values.slice(1));
      });
    }

    if (allRows.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Archivo vacío o inválido' } });
    }

    let imported = 0;
    const errors = [];

    for (let i = 1; i < allRows.length; i++) {
      const [listNumber, lastName, firstName] = allRows[i];
      if (!listNumber || !lastName || !firstName) continue;
      try {
        await Student.create({
          courseId,
          userId: req.userId,
          listNumber: parseInt(listNumber, 10),
          lastName: String(lastName).trim(),
          firstName: String(firstName).trim()
        });
        imported++;
      } catch (e) {
        errors.push({ row: i + 1, error: e.message });
      }
    }

    const dataRows = Math.max(allRows.length - 1, 0);
    res.json({ success: true, data: { imported, skipped: dataRows - imported, errors } });
  } catch (err) { next(err); }
}

module.exports = { list, create, getOne, update, remove, importStudents };
