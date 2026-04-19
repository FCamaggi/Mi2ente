import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data).then(r => r.data.data),
  login: (data) => client.post('/auth/login', data).then(r => r.data.data),
  refresh: () => client.post('/auth/refresh').then(r => r.data.data),
  logout: () => client.post('/auth/logout').then(r => r.data.data),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }).then(r => r.data.data),
  resetPassword: (token, password) => client.post(`/auth/reset-password/${token}`, { password }).then(r => r.data.data),
};
