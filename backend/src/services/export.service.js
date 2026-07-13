const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const Observation = require('../models/Observation');
const { weightedAverage, getSituacion } = require('../utils/gradeCalculator');
const { getEffectiveWeight } = require('../utils/evaluationWeights');
const { buildStudentSummary, sortedPeriods } = require('../utils/periods');

function buildEvaluationFilter(courseId, options = {}) {
  const filter = { courseId };
  if (options.scope === 'annual') return filter;
  if (options.periodId) filter.periodId = options.periodId;
  const ids = Array.isArray(options.evaluationIds)
    ? options.evaluationIds
    : String(options.evaluationIds || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

  if (ids.length > 0) filter._id = { $in: ids };

  const dateFilter = {};
  if (options.from) dateFilter.$gte = new Date(`${options.from}T00:00:00.000Z`);
  if (options.to) dateFilter.$lte = new Date(`${options.to}T23:59:59.999Z`);
  if (Object.keys(dateFilter).length > 0) filter.date = dateFilter;

  return filter;
}

function formatGradeCell(grade) {
  if (!grade || grade.status === 'pending') return '';
  if (grade.status === 'absent') return 'Ausente';
  if (grade.status === 'exempt') return 'Exento';
  return grade.value;
}

async function toExcel(courseId, course, options = {}) {
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }).sort({ listNumber: 1 }),
    Evaluation.find(buildEvaluationFilter(courseId, options)).sort({ order: 1 }),
    Grade.find({ courseId })
  ]);

  const { passGrade, decimals } = course.gradeConfig;

  const workbook = new ExcelJS.Workbook();
  const periods = sortedPeriods(course);

  if (options.scope === 'annual') {
    const sheet = workbook.addWorksheet('Resumen anual');
    sheet.addRow(['N°', 'Apellidos', 'Nombre', ...periods.map((period) => `${period.name} (${period.weight}%)`), 'Promedio anual', 'Situación', 'Estado']);
    sheet.getRow(1).font = { bold: true };
    students.forEach((student) => {
      const studentGrades = grades.filter((grade) => grade.studentId.toString() === student._id.toString());
      const summary = buildStudentSummary(studentGrades, evaluations, course);
      sheet.addRow([
        student.listNumber,
        student.lastName,
        student.firstName,
        ...summary.periodAverages.map((period) => period.average ?? ''),
        summary.annualAverage ?? '',
        summary.annualStatus === 'aprobado' ? 'Aprobado/a' : summary.annualStatus === 'reprobado' ? 'Reprobado/a' : 'Sin notas',
        summary.annualAverage === null ? 'Sin notas' : summary.provisional ? 'Provisional' : 'Final'
      ]);
    });
    return workbook.xlsx.writeBuffer();
  }

  const sheet = workbook.addWorksheet('Notas');

  sheet.addRow([
    'N°', 'Apellidos', 'Nombre',
    ...evaluations.map((evaluation) => `${evaluation.name} ${getEffectiveWeight(evaluation).toFixed(1)}%`),
    'Promedio', 'Situación'
  ]);
  sheet.getRow(1).font = { bold: true };

  students.forEach((student) => {
    const studentGrades = grades.filter((grade) => grade.studentId.toString() === student._id.toString());
    const gradeValues = evaluations.map((evaluation) => {
      const grade = studentGrades.find((item) => item.evaluationId.toString() === evaluation._id.toString());
      return formatGradeCell(grade);
    });
    const avg = weightedAverage(studentGrades, evaluations, decimals);
    const sit = getSituacion(avg, passGrade);
    sheet.addRow([
      student.listNumber, student.lastName, student.firstName,
      ...gradeValues,
      avg ?? '',
      sit === 'aprobado' ? 'Aprobado/a' : sit === 'reprobado' ? 'Reprobado/a' : 'Sin notas'
    ]);
  });

  return workbook.xlsx.writeBuffer();
}

async function studentToExcel(courseId, course, studentId, options = {}) {
  const [student, evaluations, grades, observations] = await Promise.all([
    Student.findOne({ _id: studentId, courseId }),
    Evaluation.find(buildEvaluationFilter(courseId, options)).sort({ order: 1 }),
    Grade.find({ courseId, studentId }),
    Observation.find({ courseId, studentId }).sort({ date: -1 })
  ]);

  if (!student) {
    const err = new Error('Alumno no encontrado');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const { passGrade, decimals } = course.gradeConfig;
  const avg = weightedAverage(grades, evaluations, decimals);
  const sit = getSituacion(avg, passGrade);

  const workbook = new ExcelJS.Workbook();
  const periods = sortedPeriods(course);
  const summary = workbook.addWorksheet('Resumen');
  summary.addRow(['Curso', course.name]);
  summary.addRow(['Alumno', `${student.lastName} ${student.firstName}`]);
  summary.addRow(['N° lista', student.listNumber]);
  if (options.scope === 'annual') {
    const annualSummary = buildStudentSummary(grades, evaluations, course);
    periods.forEach((period) => {
      const value = annualSummary.periodAverages.find((item) => item.periodId.toString() === period._id.toString())?.average;
      summary.addRow([`Promedio ${period.name}`, value ?? '']);
    });
    summary.addRow(['Promedio anual', annualSummary.annualAverage ?? '']);
    summary.addRow(['Estado anual', annualSummary.provisional ? 'Provisional' : 'Final']);
  } else {
    summary.addRow(['Promedio', avg ?? '']);
  }
  summary.addRow(['Situación', sit === 'aprobado' ? 'Aprobado/a' : sit === 'reprobado' ? 'Reprobado/a' : 'Sin notas']);
  summary.getColumn(1).font = { bold: true };

  const gradesSheet = workbook.addWorksheet('Notas');
  gradesSheet.addRow(['Evaluación', 'Tipo', 'Grupo', 'Ponderación efectiva', 'Nota']);
  gradesSheet.getRow(1).font = { bold: true };
  evaluations.forEach((evaluation) => {
    const grade = grades.find((item) => item.evaluationId.toString() === evaluation._id.toString());
    gradesSheet.addRow([
      evaluation.name,
      evaluation.type,
      evaluation.groupName || '',
      getEffectiveWeight(evaluation),
      formatGradeCell(grade)
    ]);
  });

  const observationsSheet = workbook.addWorksheet('Observaciones');
  observationsSheet.addRow(['Fecha', 'Categoría', 'Observación']);
  observationsSheet.getRow(1).font = { bold: true };
  observations.forEach((observation) => {
    observationsSheet.addRow([
      observation.date ? observation.date.toISOString().slice(0, 10) : '',
      observation.category,
      observation.text
    ]);
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = { toExcel, studentToExcel };
