import client from './client';

export const usersApi = {
  getMe: () => client.get('/users/me').then(r => r.data.data),
  updateMe: (data) => client.patch('/users/me', data).then(r => r.data.data),
  changePassword: (data) => client.patch('/users/me/password', data).then(r => r.data.data),
};
