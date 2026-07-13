const test = require('node:test');
const assert = require('node:assert/strict');
const { weightedAverage, calculateAnnualAverage } = require('../src/utils/gradeCalculator');

function evaluation(id, weight) {
  return { _id: { toString: () => id }, weight, groupName: '' };
}

function grade(evaluationId, value, status = 'graded') {
  return { evaluationId: { toString: () => evaluationId }, value, status };
}

test('calcula el promedio ponderado de un período ignorando ausentes y pendientes', () => {
  const evaluations = [evaluation('a', 40), evaluation('b', 60), evaluation('c', 20)];
  const grades = [grade('a', 5), grade('b', 6), grade('c', null, 'absent')];
  assert.equal(weightedAverage(grades, evaluations, 1), 5.6);
});

test('calcula el promedio anual con pesos configurables', () => {
  const result = calculateAnnualAverage([
    { average: 5, rawAverage: 5, weight: 40 },
    { average: 6, rawAverage: 6, weight: 60 }
  ], 1);
  assert.deepEqual(result, { average: 5.6, provisional: false });
});

test('normaliza períodos disponibles y marca el promedio como provisional', () => {
  const result = calculateAnnualAverage([
    { average: 5.4, rawAverage: 5.4, weight: 40 },
    { average: null, rawAverage: null, weight: 60 }
  ], 1);
  assert.deepEqual(result, { average: 5.4, provisional: true });
});
