import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './Registro.css';
import Footer from '../components/Footer';

function RegistroChocolate() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    fechaNacimiento: '',
    provincia: '',
    ciudad: '',
    telefono: '',
    aceptaTerminos: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) {
      alert('Debe aceptar los términos y condiciones');
      return;
    }
    console.log('Datos enviados:', formData);
  };

  return (
    <>
      <div className="chocolate-registro-container">
        <div className="chocolate-formulario-lateral">
          <div className="chocolate-form-wrapper">
            <h2 className="chocolate-title text-center mb-4">REGISTRO DE USUARIO</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tu nombre completo"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
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
                <Form.Label className="chocolate-label">Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <div className="chocolate-grid">
                <Form.Group className="chocolate-form-group mb-3">
                  <Form.Label className="chocolate-label">Provincia</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tu provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    className="chocolate-input"
                    required
                  />
                </Form.Group>

                <Form.Group className="chocolate-form-group mb-3">
                  <Form.Label className="chocolate-label">Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tu ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="chocolate-input"
                    required
                  />
                </Form.Group>
              </div>

              <Form.Group className="chocolate-form-group mb-3">
                <Form.Label className="chocolate-label">Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Tu teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="chocolate-input"
                  required
                />
              </Form.Group>

              <Form.Group className="chocolate-checkbox-group mb-4">
                <Form.Check
                  type="checkbox"
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

export default RegistroChocolate;