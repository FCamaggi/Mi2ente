import client from './client';

export const studentsApi = {
  list: (courseId, params) => client.get(`/courses/${courseId}/students`, { params }).then(r => r.data.data),
  create: (courseId, data) => client.post(`/courses/${courseId}/students`, data).then(r => r.data.data),
  getOne: (courseId, studentId) => client.get(`/courses/${courseId}/students/${studentId}`).then(r => r.data.data),
  update: (courseId, studentId, data) => client.put(`/courses/${courseId}/students/${studentId}`, data).then(r => r.data.data),
  remove: (courseId, studentId) => client.delete(`/courses/${courseId}/students/${studentId}`).then(r => r.data.data),
  import: (courseId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post(`/courses/${courseId}/students/import`, fd).then(r => r.data.data);
  }
};
