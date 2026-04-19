const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const { weightedAverage, getSituacion } = require('../utils/gradeCalculator');
const { getEffectiveWeight } = require('../utils/evaluationWeights');

async function toExcel(courseId, course) {
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }).sort({ listNumber: 1 }),
    Evaluation.find({ courseId }).sort({ order: 1 }),
    Grade.find({ courseId })
  ]);

  const { passGrade, decimals } = course.gradeConfig;

  const workbook = new ExcelJS.Workbook();
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
      if (!grade || grade.status === 'pending') return '';
      if (grade.status === 'absent') return 'Ausente';
      if (grade.status === 'exempt') return 'Exento';
      return grade.value;
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

module.exports = { toExcel };
