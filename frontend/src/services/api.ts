import axios from 'axios';
import { useUserStore } from '../context/userStore';

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
  const currentUser = useUserStore.getState().currentUser;
  if (currentUser && config.headers) {
    config.headers['X-Current-User-Id'] = currentUser.id;
  }
  return config;
});

export default api;
