import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'react-feather';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext';
import Footer from '../components/Footer';

function Cart() {
  const chocolate = '#7b4b32';
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    setCartItems,
    metodoEntrega,
    setMetodoEntrega,
    costoEnvio
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);

  // CartContext ya persiste en localStorage cuando cambia cartItems, así que
  // acá alcanza con actualizar el estado.
  const cambiarCantidad = (id, delta) => {
    const item = cartItems.find(ci => ci.id === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    if (typeof item.stock === 'number' && nuevaCantidad > item.stock) {
      toast.error(`Solo quedan ${item.stock} unidades de ${item.nombre}`);
      return;
    }

    setCartItems(cartItems.map(ci =>
      ci.id === id ? { ...ci, cantidad: nuevaCantidad } : ci
    ));
  };

  const handleSumar = (id) => cambiarCantidad(id, 1);
  const handleRestar = (id) => cambiarCantidad(id, -1);

  const handleQuitar = (id) => {
    removeFromCart(id); // Quita el ítem completamente del estado
  };

  const handleVaciar = async () => {
    setIsLoading(true);
    await clearCart();
    setIsLoading(false);
  };

  const handleComprar = () => {
    navigate('/pago');
  };

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  // El costo lo dicta el backend (GET /costo-envio) y el retiro en el local no
  // paga envío. Mientras no haya llegado la respuesta se muestra un guion en
  // vez de un número inventado.
  const envioConocido = costoEnvio !== null;
  const shipping = metodoEntrega === 'retiro' ? 0 : (costoEnvio ?? 0);
  const finalTotal = total + shipping;

  if (cartItems.length === 0) {
    return (
      <>
        <div style={{ background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' }}>
          <div className="container py-5 text-center">
            <ShoppingBag size={80} color={chocolate} className="mb-4" />
            <h2 style={{ color: chocolate }}>Tu carrito está vacío</h2>
            <button className="btn" style={{ color: chocolate }} onClick={() => navigate('/productos')}>
              Ver productos
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' }}>
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: chocolate }}>Carrito de compras</h2>
            <button className="btn" disabled={isLoading}
              style={{
                border: `2px solid ${chocolate}`,
                color: chocolate,
                boxShadow: '0 2px 6px rgba(27, 26, 25, 0.15)',
                transition: 'box-shadow 0.3s ease',
              }}
              onClick={handleVaciar}>
              <Trash2 size={16} /> Vaciar carrito
            </button>
          </div>
          <div className="row g-4">
            <div className="col-lg-8">
              {cartItems.map((item) => (
                <div key={item.id} className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center" style={{ padding: '1rem 1.25rem' }}>
                    <div className="d-flex align-items-center" style={{ flex: 2 }}>
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        style={{ width: '60px', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                        className="me-3"
                      />
                      <div>
                        <h6 className="mb-0">{item.nombre}</h6>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center" style={{ flex: 2 }}>
                      <button
                        className="btn btn-outline-secondary btn-sm me-1"
                        style={{ borderColor: chocolate, color: chocolate }}
                        onClick={() => handleRestar(item.id)}
                        disabled={item.cantidad <= 1}
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="mx-2 fw-semibold">{item.cantidad}</span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ borderColor: chocolate, color: chocolate }}
                        onClick={() => handleSumar(item.id)}
                        aria-label={`Agregar una unidad de ${item.nombre}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center" style={{ flex: 1 }}>
                      <div className="fw-bold">${(item.precio * item.cantidad).toFixed(2)}</div>
                      <button
                        onClick={() => handleQuitar(item.id)}
                        className="btn p-0 text-danger ms-3"
                        aria-label={`Quitar ${item.nombre} del carrito`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header" style={{ backgroundColor: chocolate, color: 'white' }}>
                  Resumen del pedido
                </div>
                <div className="card-body">
                  <fieldset className="mb-3">
                    <legend className="fs-6 fw-semibold" style={{ color: chocolate }}>
                      ¿Cómo lo querés recibir?
                    </legend>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="metodoEntrega"
                        id="entrega-envio"
                        value="envio"
                        checked={metodoEntrega === 'envio'}
                        onChange={() => setMetodoEntrega('envio')}
                      />
                      <label className="form-check-label" htmlFor="entrega-envio">
                        Envío a domicilio
                        {envioConocido && ` (+$${costoEnvio.toFixed(2)})`}
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="metodoEntrega"
                        id="entrega-retiro"
                        value="retiro"
                        checked={metodoEntrega === 'retiro'}
                        onChange={() => setMetodoEntrega('retiro')}
                      />
                      <label className="form-check-label" htmlFor="entrega-retiro">
                        Retiro en el local (sin cargo)
                      </label>
                    </div>
                  </fieldset>

                  <p>Subtotal: ${total.toFixed(2)}</p>
                  <p>
                    Envío: {envioConocido || metodoEntrega === 'retiro'
                      ? `$${shipping.toFixed(2)}`
                      : '—'}
                  </p>
                  <hr />
                  <h5>Total: ${finalTotal.toFixed(2)}</h5>
                  <button
                    className="btn w-100 mt-3"
                    style={{
                      border: `2px solid ${chocolate}`,
                      color: chocolate,
                      boxShadow: '0 2px 6px rgba(27, 26, 25, 0.15)',
                      transition: 'box-shadow 0.3s ease',
                      fontWeight: '600',
                      height: '38px',
                    }}
                    onClick={handleComprar}
                    disabled={isLoading}
                  >
                    Proceder al pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Cart;