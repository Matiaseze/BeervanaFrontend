import axios from 'axios';

// Usá el dominio real si está en producción
const api = axios.create({
  baseURL: 'https://beervana.vercel.app/my_api'
    /* baseURL: 'https://beervana-4i1bzpr9o-rodrigos-projects-fa5acc60.vercel.app/my_api', // Test: desde la preview en vercel */
    /* baseURL: 'http://localhost:8000/my_api', // prefijo personalizado */
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
