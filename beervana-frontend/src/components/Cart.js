import React from 'react';
import { useCart } from '../CartContext';

function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mt-4">
      <h2>Carrito de compras</h2>
      {cartItems.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {item.name} x {item.quantity}
                </div>
                <div>
                  ${item.price.toFixed(2)}{' '}
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => removeFromCart(item.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h4>Total: ${total.toFixed(2)}</h4>
          <button className="btn btn-secondary mt-3" onClick={clearCart}>Vaciar carrito</button>
        </>
      )}
    </div>
  );
}

export default Cart;
