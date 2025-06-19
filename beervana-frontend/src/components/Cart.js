import React from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'react-feather';

function Cart() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 200 : 0;
  const finalTotal = total + shipping;

  const chocolate = '#7b4b32';

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <ShoppingBag size={80} color={chocolate} className="mb-4" />
        <h2 style={{ color: chocolate }}>Tu carrito está vacío</h2>
        <p style={{ color: chocolate, opacity: 0.8 }}>¡Descubrí nuestras mejores birras!</p>
        <button
          className="btn"
          style={{
            borderColor: chocolate,
            color: chocolate,
            backgroundColor: 'transparent',
            borderWidth: '2px',
          }}
          onClick={() => navigate('/productos')}
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontFamily: "'Oswald', sans-serif", color: '#5c2e10' }}>
          Carrito de compras
        </h2>
        <button
          className="btn d-flex align-items-center"
          onClick={clearCart}
          style={{ color: chocolate, borderColor: chocolate }}
        >
          <Trash2 size={16} className="me-2" color={chocolate} />
          Vaciar carrito
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="card mb-3 rounded-3 shadow-sm"
              style={{ border: `1.5px solid ${chocolate}` }}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                  <div>
                    <h6 style={{ color: chocolate }} className="mb-0">{item.name}</h6>
                    <small className="text-muted">{item.description}</small>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="input-group input-group-sm me-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="input-group-text bg-white" style={{ color: chocolate }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-center" style={{ minWidth: '100px' }}>
                    <div className="fw-bold" style={{ color: chocolate }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="btn p-0 mt-1"
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: chocolate }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card bg-white text-dark border rounded-3 shadow-sm">
            <div className="card-header" style={{ backgroundColor: chocolate, color: 'white' }}>
              <h5 className="mb-0">Resumen del pedido</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold text-dark h5">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              <button
                className="btn w-100 mt-4"
                style={{ backgroundColor: chocolate, color: 'white' }}
              >
                Proceder al pago
              </button>

              <button
                className="btn w-100 mt-2"
                style={{ border: `1px solid ${chocolate}`, color: chocolate }}
              >
                Calcular Envío
              </button>

              <div className="text-muted mt-3 small">
                <p>• Envío gratis en compras mayores a $50.000</p>
                <p>• Entrega rápida en 2-3 días</p>
                <p>• Garantía de calidad artesanal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
