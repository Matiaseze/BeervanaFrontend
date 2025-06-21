import api from './api';

export const login = async (email, password) => {
  console.log(email, password)
  const response = await api.post('/login', { 
    email, 
    password 
  },{
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
  }
});

  console.log("DEBUG")
  localStorage.setItem('token', response.data.token); // guardar token
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
};
