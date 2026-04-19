import client from './client';

export const coursesApi = {
  list: (params) => client.get('/courses', { params }).then(r => r.data.data),
  create: (data) => client.post('/courses', data).then(r => r.data.data),
  getOne: (id) => client.get(`/courses/${id}`).then(r => r.data.data),
  update: (id, data) => client.patch(`/courses/${id}`, data).then(r => r.data.data),
  remove: (id) => client.delete(`/courses/${id}`).then(r => r.data.data),
  duplicate: (id, data) => client.post(`/courses/${id}/duplicate`, data).then(r => r.data.data),
  getStats: (id) => client.get(`/courses/${id}/stats`).then(r => r.data.data),
  exportExcel: (id) => client.get(`/courses/${id}/export/excel`, { responseType: 'blob' }),
  downloadBlob: (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
