// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/auth';
import { useAuth } from '../AuthContext';
import { Form, Button } from 'react-bootstrap';
import './Registro.css'; // Reutilizamos el CSS
import Footer from './Footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginService(email, password);
      login(data.token); // actualiza el contexto y localStorage

      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Credenciales incorrectas o error del servidor');
    }
  };

  return (
    <>
      <div className="chocolate-registro-container">
        <div className="chocolate-formulario-lateral">
          <div className="chocolate-form-wrapper">
            <h2 className="custom-title text-center mb-4">INICIAR SESIÓN</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <Form.Group className="chocolate-form-group mb-4">
                <Form.Label className="chocolate-label">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="chocolate-input"
                  required
                />
              </Form.Group>


              <div className="text-center mt-3 py-3">
                <a href="/registro">¿No tenés cuenta? Registrate</a>
              </div>

              <Button type="submit" className="chocolate-submit-btn w-100">
                INICIAR SESIÓN
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
