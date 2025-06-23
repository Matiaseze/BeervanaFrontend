import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { pagarFactura } from '../services/factura';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Pago() {
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

  if (loading) return <div className="container py-5 text-center">Cargando factura...</div>;

  if (!factura) return null;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Resumen de Factura</h2>
      <div className="card mb-4">
        <div className="card-body">
          <p><strong>Fecha:</strong> {new Date(factura.fecha).toLocaleString()}</p>
          <ul className="list-group mb-3">
            {factura.detalles.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between">
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

      <h4>Elegí método de pago:</h4>
      <div className="d-flex gap-3 mb-4">
        <button className="btn btn-primary" onClick={handlePago}>Pagar con tarjeta (simulado)</button>
        <button className="btn btn-secondary" disabled>Mercado Pago (próximamente)</button>
      </div>
    </div>
  );
}

export default Pago;