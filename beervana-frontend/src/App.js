import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import Home from './components/Home';
import Registro from './components/Registro';
import SobreNosotros from './components/SobreNosotros';
import Cart from './components/Cart';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { CartProvider } from './CartContext'; // <- importás el provider
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
