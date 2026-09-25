import axios from 'axios';

/**
 * A qué backend le pega el frontend.
 *
 * Sale de REACT_APP_API_URL en vez de estar escrito acá, así cambiar de backend
 * no es editar código: se cambia el valor y se rearma. Antes había tres URLs
 * comentadas y había que acordarse de cuál descomentar antes de deployar, que
 * es exactamente cómo se termina publicando el frontend apuntando a localhost.
 *
 * De dónde sale el valor, de mayor a menor prioridad:
 *
 *   1. Variable de entorno real   -> docker-compose la define para desarrollo;
 *                                    en Vercel se carga en Settings del proyecto.
 *   2. .env.development.local     -> tu override personal (no va al repo).
 *   3. .env.development           -> default de `npm start`.
 *      .env.production            -> default de `npm run build`, que es lo que
 *                                    corre Vercel.
 *
 * OJO con algo de Create React App: el valor se incrusta en el bundle al
 * COMPILAR, no se lee al ejecutar. Cambiarlo en Vercel no alcanza: hay que
 * volver a deployar para que tome efecto.
 */
const URL_API = process.env.REACT_APP_API_URL || 'http://localhost:8000/my_api';

const api = axios.create({
  baseURL: URL_API,
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
