import client from './client';

export const gradesApi = {
  listByCourse: (courseId) => client.get(`/courses/${courseId}/grades`).then(r => r.data.data),
  upsert: (courseId, studentId, evalId, data) =>
    client.put(`/courses/${courseId}/grades/${studentId}/${evalId}`, data).then(r => r.data.data),
  batch: (courseId, grades) =>
    client.post(`/courses/${courseId}/grades/batch`, { grades }).then(r => r.data.data),
};
