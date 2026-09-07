import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './Registro.css';
import Footer from '../components/Footer';
import { register, login as loginService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    aceptaTerminos: false,
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) {
      toast.error('Debe aceptar los términos y condiciones');
      return;
    }

    try {
      const userData = {
        name: formData.nombre,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password,
      };

      await register(userData);

      // login automático. Usa el login del AuthContext, no solo el del
      // servicio: si no, el token queda en localStorage pero el estado de
      // sesión sigue en null y el Navbar te muestra como deslogueado.
      const data = await loginService(formData.email, formData.password);
      await login(data.token);

      toast.success('¡Registro exitoso! Bienvenido a Beervana');
      navigate('/'); // o a /productos, como prefieras
    } catch (err) {
      console.error('Error al registrar:', err);
      const errores = err.response?.data?.errors;
      toast.error(
        errores ? Object.values(errores).flat().join(' ') : 'Error al registrarse'
      );
    }
  };

  return (
    <>
      <div className="chocolate-registro-container">
        <div className="chocolate-formulario-lateral">
          <div className="chocolate-form-wrapper">
            <h2 className="chocolate-title text-center mb-4">REGISTRO DE USUARIO</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tu nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ejemplo@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="********"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <Form.Group className="chocolate-checkbox-group mb-4">
                <Form.Check
                  type="checkbox"
                  id="aceptaTerminos"
                  name="aceptaTerminos"
                  label="Acepto los términos y condiciones"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                  className="chocolate-checkbox"
                  required
                />
              </Form.Group>

              <Button 
                type="submit" 
                className="chocolate-submit-btn w-100"
                disabled={!formData.aceptaTerminos}
              >
                REGISTRARSE
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Registro;
