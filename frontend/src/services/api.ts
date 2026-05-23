import axios from 'axios';

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('taskify:token')
      : null;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
