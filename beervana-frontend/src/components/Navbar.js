import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Ber.png';
import { ShoppingCart, Package } from 'react-feather';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { cartItems, pedidoPendiente } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const itemCount = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada con éxito');
    navigate('/');
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
            <li className="nav-item">
              <Link className="nav-link" style={{ fontSize: '1.4rem' }} to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" style={{ fontSize: '1.4rem' }} to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" style={{ fontSize: '1.4rem' }} to="/sobre-nosotros">Sobre nosotros</Link>
            </li>
          </ul>

          <div className="d-flex">
            {isAuthenticated ? (
              <>
                <Link to="/compras" className="btn btn-outline-light d-flex align-items-center me-2">
                  <Package size={16} />
                  <span className="ms-2">Compras</span>
                </Link>
                {/* Con el carrito vacío y un pedido esperando pago, el botón
                    lleva al pedido: el carrito se vació justamente al crearlo.
                    Si el usuario armó un carrito nuevo, ese tiene prioridad;
                    si no, no habría forma de llegar a /cart desde el Navbar. */}
                {itemCount === 0 && pedidoPendiente ? (
                  <Link
                    to={`/pedidos/${pedidoPendiente.codigo}`}
                    className="btn btn-outline-warning d-flex align-items-center me-2"
                  >
                    <ShoppingCart size={16} />
                    <span className="ms-2">Pedido pendiente</span>
                  </Link>
                ) : (
                  <Link to="/cart" className="btn btn-outline-light d-flex align-items-center me-2">
                    <ShoppingCart size={16} />
                    <span className="ms-2">Carrito ({itemCount})</span>
                  </Link>
                )}
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
