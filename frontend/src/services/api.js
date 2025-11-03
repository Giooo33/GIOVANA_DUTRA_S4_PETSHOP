import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // A URL do seu backend Django
});

// (Opcional, mas bom) Interceptor para adicionar o Token de Auth
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`; // Ou `Bearer ${token}` dependendo da auth
  }
  return config;
});

export default api;