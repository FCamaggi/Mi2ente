import client from './client';

export const evaluationsApi = {
  list: (courseId) => client.get(`/courses/${courseId}/evaluations`).then(r => r.data.data),
  create: (courseId, data) => client.post(`/courses/${courseId}/evaluations`, data).then(r => r.data.data),
  update: (courseId, evalId, data) => client.put(`/courses/${courseId}/evaluations/${evalId}`, data).then(r => r.data.data),
  remove: (courseId, evalId) => client.delete(`/courses/${courseId}/evaluations/${evalId}`).then(r => r.data.data),
  reorder: (courseId, order) => client.patch(`/courses/${courseId}/evaluations/reorder`, { order }).then(r => r.data.data),
};
