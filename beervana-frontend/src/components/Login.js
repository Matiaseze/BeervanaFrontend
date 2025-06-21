import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth'; // ajustá el path según tu estructura

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login({ email, password });

      console.log('Login OK:', res);

      

      // Ya se guardó el token en localStorage en el servicio
      navigate('/'); // o donde quieras redirigir después del login
    } catch (err) {
      console.error('Error de login:', err);
      setError('Credenciales inválidas o error de red.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-100">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default Login;
