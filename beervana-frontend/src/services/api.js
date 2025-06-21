import axios from 'axios';

// Usá el dominio real si está en producción
const api = axios.create({
  baseURL: 'http://localhost:8000/my_api', // prefijo personalizado
});

// Agregar token automáticamente si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;