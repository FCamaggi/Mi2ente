import client from './client';

export const schoolsApi = {
  list: () => client.get('/schools').then(r => r.data.data.schools),
  create: (data) => client.post('/schools', data).then(r => r.data.data.school),
  update: (id, data) => client.put(`/schools/${id}`, data).then(r => r.data.data.school),
  remove: (id) => client.delete(`/schools/${id}`).then(r => r.data.data)
};
