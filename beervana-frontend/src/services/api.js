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

// Rutas que responden 401 como parte de su funcionamiento normal: un login con
// credenciales incorrectas no significa que la sesión haya vencido.
const RUTAS_PUBLICAS = ['/login', '/register'];

// Sesión vencida: sin esto el token inválido quedaba en localStorage,
// isAuthenticated seguía en true porque solo mira que exista, y cada request
// moría en silencio. Desde la UI se ve como "hago click y no pasa nada".
api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || '';
    const esPublica = RUTAS_PUBLICAS.some(ruta => url.endsWith(ruta));

    if (error.response?.status === 401 && !esPublica && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      // Redirección dura: este módulo está fuera del árbol de React y no puede
      // usar useNavigate. Al recargar, AuthProvider arranca sin sesión.
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
