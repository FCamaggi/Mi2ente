import client from './client';

export const observationsApi = {
  list: (courseId, studentId) => client.get(`/courses/${courseId}/students/${studentId}/observations`).then(r => r.data.data),
  create: (courseId, studentId, data) => client.post(`/courses/${courseId}/students/${studentId}/observations`, data).then(r => r.data.data),
  update: (courseId, studentId, obsId, data) => client.put(`/courses/${courseId}/students/${studentId}/observations/${obsId}`, data).then(r => r.data.data),
  remove: (courseId, studentId, obsId) => client.delete(`/courses/${courseId}/students/${studentId}/observations/${obsId}`).then(r => r.data.data),
};
