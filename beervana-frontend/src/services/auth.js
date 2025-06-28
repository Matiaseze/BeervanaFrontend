// src/services/auth.js
import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  localStorage.setItem('token', response.data.token); // ya no lo usás acá si usás AuthContext
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logout = async () => {
  await api.post('/logout'); // Laravel cierra sesión del lado backend
};

/* export const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
}; */
