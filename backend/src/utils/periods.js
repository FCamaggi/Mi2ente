const mongoose = require('mongoose');
const { weightedAverage, getSituacion, calculateAnnualAverage } = require('./gradeCalculator');

function defaultPeriods() {
  return [
    { _id: new mongoose.Types.ObjectId(), name: 'Semestre 1', weight: 50, order: 0 },
    { _id: new mongoose.Types.ObjectId(), name: 'Semestre 2', weight: 50, order: 1 }
  ];
}

function sortedPeriods(course) {
  return [...(course?.periods || [])].sort((a, b) => a.order - b.order);
}

function periodExists(course, periodId) {
  if (!periodId) return false;
  return sortedPeriods(course).some((period) => period._id.toString() === periodId.toString());
}

function evaluationsForPeriod(evaluations, periodId, fallbackPeriodId = null) {
  return evaluations.filter((evaluation) => {
    if (evaluation.periodId) return evaluation.periodId.toString() === periodId.toString();
    return fallbackPeriodId && fallbackPeriodId.toString() === periodId.toString();
  });
}

function calculatePeriodAverages(grades, evaluations, periods, decimals = 1) {
  const firstPeriodId = periods[0]?._id;
  return periods.map((period) => {
    const periodEvaluations = evaluationsForPeriod(evaluations, period._id, firstPeriodId);
    const rawAverage = weightedAverage(grades, periodEvaluations, 6);
    return {
      periodId: period._id,
      name: period.name,
      weight: period.weight,
      average: rawAverage === null ? null : parseFloat(rawAverage.toFixed(decimals)),
      rawAverage
    };
  });
}

function buildStudentSummary(grades, evaluations, course) {
  const periods = sortedPeriods(course);
  const calculated = calculatePeriodAverages(grades, evaluations, periods, course.gradeConfig.decimals);
  const periodAverages = calculated.map(({ rawAverage, ...period }) => period);
  const annual = calculateAnnualAverage(calculated, course.gradeConfig.decimals);
  return {
    periodAverages,
    annualAverage: annual.average,
    annualStatus: getSituacion(annual.average, course.gradeConfig.passGrade),
    provisional: annual.provisional
  };
}

module.exports = {
  defaultPeriods,
  sortedPeriods,
  periodExists,
  evaluationsForPeriod,
  calculatePeriodAverages,
  calculateAnnualAverage,
  buildStudentSummary
};
