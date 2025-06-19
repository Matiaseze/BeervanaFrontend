import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import logo from '../assets/Ber.png';
import { ShoppingCart } from 'react-feather';


function Navbar() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
        <img src={logo} alt="Logo" height="100" style={{ objectFit: 'contain' }} />
      </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacto">Contacto</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sobre-nosotros">Sobre nosotros</Link>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <Link to="/registro" className="btn btn-outline-warning ms-2">
              Registrarse
            </Link>
            <Link to="/cart" className="btn btn-outline-light d-flex align-items-center gap-2">
              <ShoppingCart size={16} />
              Carrito ({itemCount})
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
