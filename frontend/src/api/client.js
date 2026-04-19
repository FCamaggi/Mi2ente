import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000
});

// Render cold-start warning: show a toast if any request takes > 5 s
let _pendingCount = 0;
let _slowTimer = null;
let _slowToastId = null;

function _onStart() {
  _pendingCount++;
  if (!_slowTimer) {
    _slowTimer = setTimeout(() => {
      if (_pendingCount > 0 && !_slowToastId) {
        _slowToastId = toast(
          '⏳ Esto está tardando más de lo usual. Es posible que el servidor esté iniciando desde estado inactivo (Render). Espera unos segundos…',
          { duration: Infinity, style: { maxWidth: 380, fontSize: '0.8rem' } }
        );
      }
    }, 5000);
  }
}

function _onEnd() {
  _pendingCount = Math.max(0, _pendingCount - 1);
  if (_pendingCount === 0) {
    clearTimeout(_slowTimer);
    _slowTimer = null;
    if (_slowToastId) {
      toast.dismiss(_slowToastId);
      _slowToastId = null;
    }
  }
}

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  _onStart();
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
}

client.interceptors.response.use(
  (res) => { _onEnd(); return res; },
  async (error) => {
    _onEnd();
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = data.data;
        useAuthStore.getState().setToken(accessToken);
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return client(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().bootstrapAnonymous();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
