import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { pagarFactura } from '../services/factura';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/Footer';

function Pago() {
  const chocolate = '#7b4b32';
  const { checkout, fetchCart } = useCart();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hasRun = useRef(false); // ✅ Para evitar múltiples ejecuciones

  useEffect(() => {
    const generarFactura = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      console.log('[CHECKOUT] Generando factura...');
      const result = await checkout();
      console.log('Factura generada:', result);

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
      console.log('Factura a pagar:', factura);
      await pagarFactura(factura.id);
      await fetchCart();
      toast.success('¡Pago realizado con éxito!');
      navigate('/');
    } catch (err) {
      console.error('Error al pagar la factura:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Error al procesar el pago');
    }
  };

  if (loading) return <div style={{ background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' }}><div className="container py-5 text-center">Cargando factura...</div> </div>;

  if (!factura) return null;

  return (
  <>
  <div style={{ background: 'linear-gradient(to right,rgb(223, 184, 145),rgb(231, 190, 152))', minHeight: '100vh', padding: '2rem' }}>
    <div className="container py-5">
      <h2 className="mb-4">Resumen de Factura</h2>
      <div className="card mb-4">
        <div className="card-body">
          <p><strong>Fecha:</strong> {new Date(factura.fecha).toLocaleString()}</p>
          <ul className="list-group mb-3">
            {factura.detalles.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between" style={{ backgroundColor: '#f5e4c3' , border: '1.5px solid #7b4b32' }}>
                <div>
                  {item.cerveza.nombre} x {item.cantidad}
                </div>
                <span>${(parseFloat(item.subtotal) || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <h5 className="text-end">Total: ${factura.precio_total.toFixed(2)}</h5>
        </div>
      </div>

      <h4>Seleccioná un método de pago:</h4>
      <div className="d-flex gap-3 mb-4">
        <button className="btn" 
          style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }}
          onClick={handlePago}>Pagar con tarjeta (simulado)</button>
        <button className="btn" 
          style={{
                      borderRadius: '5px',
                      border: `1.5px solid ${chocolate}`,
                      color: chocolate,
                      backgroundColor: 'transparent',
                      fontWeight: '600',
                      padding: '0.35rem 1rem',
                    }}
          disabled>Mercado Pago (próximamente)</button>
      </div>
    </div>
  </div>
  {/* Footer */}
    <Footer />
  </>
  );
}

export default Pago;