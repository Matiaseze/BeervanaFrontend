import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

function Navbar() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Marca */}
        <Link className="navbar-brand" to="/">Tienda</Link>

        {/* Toggle para colapsar en móvil */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces centrales y carrito */}
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacto">Contacto</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sobre-nosotros">Sobre nosotros</Link>
            </li>
          </ul>
          <Link to="/cart" className="btn btn-outline-light">
            Carrito ({itemCount})
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
