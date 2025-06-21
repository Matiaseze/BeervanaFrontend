import axios from 'axios';

// Usá el dominio real si está en producción
const api = axios.create({
  baseURL: 'https://beervana-3w480a352-rodrigos-projects-fa5acc60.vercel.app/my_api', // prefijo personalizado
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