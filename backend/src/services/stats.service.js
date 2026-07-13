const Student = require('../models/Student');
const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const { weightedAverage, calcStats } = require('../utils/gradeCalculator');
const { getEffectiveWeight } = require('../utils/evaluationWeights');
const { buildStudentSummary, sortedPeriods, evaluationsForPeriod } = require('../utils/periods');

function summarizeStudents(studentAverages, totalStudents, passGrade) {
  const valid = studentAverages.filter(s => s.avg !== null);
  const passed = valid.filter(s => s.avg >= passGrade).length;
  return {
    ...calcStats(studentAverages.map(s => s.avg)),
    totalStudents,
    studentsWithGrades: valid.length,
    passed,
    failed: valid.length - passed,
    passRate: valid.length > 0 ? parseFloat((passed / valid.length).toFixed(3)) : 0
  };
}

async function getCourseStats(courseId, gradeConfig, course) {
  const { passGrade } = gradeConfig;
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }),
    Evaluation.find({ courseId }),
    Grade.find({ courseId })
  ]);

  const averages = students.map(s => {
    const sg = grades.filter(g => g.studentId.toString() === s._id.toString());
    return buildStudentSummary(sg, evaluations, course).annualAverage;
  });

  const valid = averages.filter(a => a !== null);
  const passed = valid.filter(a => a >= passGrade).length;
  const stats = calcStats(averages);

  return {
    ...stats,
    totalStudents: students.length,
    studentsWithGrades: valid.length,
    passed,
    failed: valid.length - passed,
    passRate: valid.length > 0 ? parseFloat((passed / valid.length).toFixed(3)) : 0
  };
}

async function getDetailedStats(courseId, gradeConfig, course, options = {}) {
  const { passGrade, decimals } = gradeConfig;
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }),
    Evaluation.find({ courseId }).sort({ order: 1 }),
    Grade.find({ courseId })
  ]);

  const periods = sortedPeriods(course);
  const selectedPeriod = options.periodId
    ? periods.find((period) => period._id.toString() === options.periodId.toString())
    : null;
  const selectedEvaluations = selectedPeriod
    ? evaluationsForPeriod(evaluations, selectedPeriod._id, periods[0]?._id)
    : evaluations;

  const studentAverages = students.map(s => {
    const sg = grades.filter(g => g.studentId.toString() === s._id.toString());
    const avg = selectedPeriod
      ? weightedAverage(sg, selectedEvaluations, decimals)
      : buildStudentSummary(sg, evaluations, course).annualAverage;
    return { student: s, avg };
  });

  const overall = summarizeStudents(studentAverages, students.length, passGrade);

  const byEvaluation = (selectedPeriod ? selectedEvaluations : []).map(ev => {
    const evGrades = grades.filter(g => g.evaluationId.toString() === ev._id.toString() && g.status === 'graded' && g.value !== null);
    const values = evGrades.map(g => g.value);
    const avg = values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null;
    const evPassed = values.filter(v => v >= passGrade).length;
    const dist = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0, '5-6': 0, '6-7': 0 };
    values.forEach(v => {
      if (v < 2) dist['1-2']++;
      else if (v < 3) dist['2-3']++;
      else if (v < 4) dist['3-4']++;
      else if (v < 5) dist['4-5']++;
      else if (v < 6) dist['5-6']++;
      else dist['6-7']++;
    });
    return {
      evaluationId: ev._id,
      name: ev.name,
      weight: ev.weight,
      effectiveWeight: getEffectiveWeight(ev),
      groupName: ev.groupName || '',
      groupWeight: ev.groupWeight ?? null,
      average: avg,
      passRate: values.length > 0 ? parseFloat((evPassed / values.length).toFixed(3)) : 0,
      gradedCount: values.length,
      distribution: dist
    };
  });

  const failed = studentAverages
    .filter(s => s.avg !== null && s.avg < passGrade)
    .map(s => ({ studentId: s.student._id, name: `${s.student.lastName} ${s.student.firstName}`, average: s.avg }))
    .sort((a, b) => a.average - b.average);

  const byPeriod = periods.map((period) => {
    const values = students.map((student) => {
      const sg = grades.filter((grade) => grade.studentId.toString() === student._id.toString());
      const pe = evaluationsForPeriod(evaluations, period._id, periods[0]?._id);
      return weightedAverage(sg, pe, decimals);
    });
    return { periodId: period._id, name: period.name, weight: period.weight, ...calcStats(values) };
  });

  return { scope: selectedPeriod ? 'period' : 'annual', periodId: selectedPeriod?._id || null, overall, byEvaluation, byPeriod, failed };
}

module.exports = { getCourseStats, getDetailedStats };
