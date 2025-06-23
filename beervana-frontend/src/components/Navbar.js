import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Ber.png';
import { ShoppingCart } from 'react-feather';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // redirige al inicio
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" height="80" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><Link className="nav-link" style={{ fontSize: '1.4rem' }} to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" style={{ fontSize: '1.4rem' }} to="/productos">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" style={{ fontSize: '1.4rem' }}to="/sobre-nosotros">Sobre nosotros</Link></li>
          </ul>
          <div className="d-flex">
            {user ? (
              <>
                <Link to="/cart" className="btn btn-outline-light d-flex align-items-center me-2">
                  <ShoppingCart size={16} />
                  <span className="ms-2">Carrito ({itemCount})</span>
                </Link>
                <button className="btn btn-outline-warning me-2" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-warning me-2">Login</Link>
                <Link to="/registro" className="btn btn-outline-warning me-2">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
