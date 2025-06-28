import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';

function Pago() {
  const chocolate = '#7b4b32';
  const { checkout, payInvoice } = useCart();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    const generarFactura = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      const result = await checkout();
      if (result) {
        setFactura(result);
      } else {
        toast.error('No se pudo generar la factura');
        navigate('/cart');
      }
      setLoading(false);
    };

    generarFactura();
  }, [checkout, navigate]);

  const handlePago = async () => {
    try {
      setProcessingPayment(true);
      await payInvoice(factura.id); // Usa el contexto para limpiar carrito
      toast.success('¡Pago realizado con éxito!');
      navigate('/');
    } catch (err) {
      console.error('Error al pagar la factura:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' }}>
        <div className="container py-5 text-center">Cargando factura...</div>
      </div>
    );
  }

  if (!factura) return null;

  return (
    <>
      <div style={{ background: 'linear-gradient(to right,rgb(223, 184, 145),rgb(231, 190, 152))', minHeight: '100vh', padding: '2rem' }}>
        <div className="container py-5">
          <h2 className="mb-4">Resumen de Factura</h2>

          {/* Tabla de detalles */}
          <div className="card mb-4">
            <div className="card-body">
              <p><strong>Fecha:</strong> {new Date(factura.fecha).toLocaleString()}</p>
              <table className="table table-bordered" style={{ backgroundColor: '#fdf7ee' }}>
                <thead style={{ backgroundColor: chocolate, color: 'white' }}>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {factura.detalles.map((item) => (
                    <tr key={item.id}>
                      <td>{item.cerveza.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                      <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h5 className="text-end mt-3">Total: ${factura.precio_total.toFixed(2)}</h5>
            </div>
          </div>

          {/* Métodos de pago */}
          <h4>Seleccioná un método de pago:</h4>
          <div className="d-flex gap-3 mb-4">
            <button
              className="btn"
              style={{
                backgroundColor: chocolate,
                color: 'white',
                border: `1.5px solid ${chocolate}`
              }}
              onClick={handlePago}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                'Pagar'
              )}
            </button>

            <button
              className="btn"
              style={{
                borderRadius: '5px',
                border: `1.5px solid ${chocolate}`,
                color: chocolate,
                backgroundColor: 'transparent',
                fontWeight: '600',
                padding: '0.35rem 1rem',
              }}
              disabled
            >
              Mercado Pago (próximamente)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Pago;