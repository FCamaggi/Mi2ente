const Student = require('../models/Student');
const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const { weightedAverage, getSituacion, calcStats } = require('../utils/gradeCalculator');
const { getEffectiveWeight } = require('../utils/evaluationWeights');

async function getCourseStats(courseId, gradeConfig) {
  const { passGrade, decimals } = gradeConfig;
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }),
    Evaluation.find({ courseId }),
    Grade.find({ courseId })
  ]);

  const averages = students.map(s => {
    const sg = grades.filter(g => g.studentId.toString() === s._id.toString());
    return weightedAverage(sg, evaluations, decimals);
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

async function getDetailedStats(courseId, gradeConfig) {
  const { passGrade, decimals } = gradeConfig;
  const [students, evaluations, grades] = await Promise.all([
    Student.find({ courseId, status: 'active' }),
    Evaluation.find({ courseId }).sort({ order: 1 }),
    Grade.find({ courseId })
  ]);

  const studentAverages = students.map(s => {
    const sg = grades.filter(g => g.studentId.toString() === s._id.toString());
    return { student: s, avg: weightedAverage(sg, evaluations, decimals) };
  });

  const valid = studentAverages.filter(s => s.avg !== null);
  const passed = valid.filter(s => s.avg >= passGrade).length;
  const overall = { ...calcStats(studentAverages.map(s => s.avg)), totalStudents: students.length, studentsWithGrades: valid.length, passed, failed: valid.length - passed, passRate: valid.length > 0 ? parseFloat((passed / valid.length).toFixed(3)) : 0 };

  const byEvaluation = evaluations.map(ev => {
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

  return { overall, byEvaluation, failed };
}

module.exports = { getCourseStats, getDetailedStats };
