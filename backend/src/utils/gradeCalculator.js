const { getEffectiveWeight } = require('./evaluationWeights');

function weightedAverage(grades, evaluations, decimals = 1) {
  let sumProduct = 0;
  let sumWeights = 0;

  for (const evaluation of evaluations) {
    const id = evaluation._id.toString();
    const grade = grades.find(g => g.evaluationId.toString() === id);
    const effectiveWeight = getEffectiveWeight(evaluation);
    if (grade && grade.status === 'graded' && grade.value !== null && grade.value !== undefined) {
      sumProduct += grade.value * effectiveWeight;
      sumWeights += effectiveWeight;
    }
  }

  if (sumWeights === 0) return null;
  return parseFloat((sumProduct / sumWeights).toFixed(decimals));
}

function getSituacion(avg, passGrade = 4.0) {
  if (avg === null || avg === undefined) return 'sin_notas';
  return avg >= passGrade ? 'aprobado' : 'reprobado';
}

function calcStats(averages) {
  const valid = averages.filter(a => a !== null);
  if (valid.length === 0) return { classAverage: null, median: null, maxGrade: null, minGrade: null, stdDev: null };

  const sum = valid.reduce((a, b) => a + b, 0);
  const mean = sum / valid.length;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
  const variance = valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / valid.length;

  return {
    classAverage: parseFloat(mean.toFixed(1)),
    median,
    maxGrade: Math.max(...valid),
    minGrade: Math.min(...valid),
    stdDev: parseFloat(Math.sqrt(variance).toFixed(2))
  };
}

module.exports = { weightedAverage, getSituacion, calcStats };
