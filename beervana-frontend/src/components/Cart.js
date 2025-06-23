import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'react-feather';
import { useCart } from '../CartContext';
import Footer from '../components/Footer';

function Cart() {
  const chocolate = '#7b4b32';
  const navigate = useNavigate();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);

  const handleAgregar = async (id) => {
    await addToCart(id, 1);
  };

  const handleRestar = async (id, cantidad) => {
    if (cantidad <= 1) return;
    await removeFromCart(id);
    await addToCart(id, cantidad - 1);
  };

  const handleQuitar = async (id) => {
    await removeFromCart(id);
  };

  const handleVaciar = async () => {
    await clearCart();
  };

  const handleComprar = () => {
    navigate('/pago');
  };

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const shipping = cartItems.length > 0 ? 200 : 0;
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
      {/* Footer */}
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
          <button className="btn" 
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
              <div className="card-body d-flex justify-content-between" style={{ padding: '1rem 1.25rem' }}>
                <div className="d-flex">
                  <img src={item.imagen_url} alt={item.nombre} style={{
                      width: '60px',
                      height: '80px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }}
                    className="me-3"
                  />
                  <div>
                    <h6>{item.nombre}</h6>
                    <small>{item.descripcion}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary btn-sm me-1"
                    style={{ borderColor: chocolate, color: chocolate }}
                    onClick={() => handleRestar(item.id, item.cantidad)}
                    disabled={item.cantidad <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mx-2">{item.cantidad}</span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    style={{ borderColor: chocolate, color: chocolate }}
                    onClick={() => handleAgregar(item.id)}
                  >
                    <Plus size={14} />
                  </button>
                  <div className="ms-4 text-end">
                    <div>${(item.precio * item.cantidad).toFixed(2)}</div>
                    <button onClick={() => handleQuitar(item.id)} className="btn p-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
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
              <p>Subtotal: ${total.toFixed(2)}</p>
              <p>Envío: ${shipping.toFixed(2)}</p>
              <hr />
              <h5>Total: ${finalTotal.toFixed(2)}</h5>
              <button
                className="btn w-100 mt-3"
                style={{
                  border: `2px solid ${chocolate}`,
                  color: chocolate,
                  boxShadow: '0 2px 6px rgba(27, 26, 25, 0.15)',
                  transition: 'box-shadow 0.3s ease',
                }}
                onClick={handleComprar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  'Proceder al pago'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* Footer */}
    <Footer />
  </>
  );
}

export default Cart;