import client from './client';

export const debugApi = {
  seed:  () => client.post('/debug/seed'),
  reset: () => client.delete('/debug/seed'),
};
