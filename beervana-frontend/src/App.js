import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import Home from './components/Home';
import Registro from './components/Registro';
import SobreNosotros from './components/SobreNosotros';
import Cart from './components/Cart';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Pago from './components/Pago';
import { CartProvider } from './CartContext'; // <- importás el provider
import { AuthProvider } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './ProtectedRoute'; // Para las rutas protegidas

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/pago" element={<Pago />} />
          </Routes>
          <ToastContainer position="top-center" autoClose={3000} />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
