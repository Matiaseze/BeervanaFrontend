import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { toast } from 'react-toastify';

/**
 * Paso intermedio entre el carrito y el pedido.
 *
 * Crea el pedido (que reserva el stock y vacía el carrito) y manda al detalle,
 * que es donde están las opciones de pago. No renderiza el pedido: si lo
 * hiciera habría dos pantallas iguales, y la URL de esta no serviría para
 * volver después.
 */
function Pago() {
  const { cartItems, cartCargado, crearPedidoDelCarrito } = useCart();
  const [mensaje, setMensaje] = useState('Reservando tu pedido...');
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    // Esperar a que el carrito esté cargado: en el primer render siempre viene
    // vacío porque fetchCart todavía está en vuelo.
    if (!cartCargado) return;

    const generarPedido = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      if (cartItems.length === 0) {
        toast.info('Tu carrito está vacío');
        navigate('/cart', { replace: true });
        return;
      }

      try {
        const pedido = await crearPedidoDelCarrito();
        // replace: que el botón "atrás" no vuelva a disparar la creación
        navigate(`/pedidos/${pedido.codigo}`, { replace: true });
      } catch (err) {
        // 409 es falta de stock: alguien se llevó las unidades mientras tanto
        const datos = err.response?.data;
        toast.error(datos?.error || datos?.message || 'No se pudo generar el pedido');
        setMensaje('No se pudo generar el pedido.');
        navigate('/cart', { replace: true });
      }
    };

    generarPedido();
  }, [cartCargado, cartItems, crearPedidoDelCarrito, navigate]);

  return (
    <div style={{ background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' }}>
      <div className="container py-5 text-center">{mensaje}</div>
    </div>
  );
}

export default Pago;
