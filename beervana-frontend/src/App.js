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
import Compras from './components/Compras';
import DetallePedido from './components/DetallePedido';
import FacturaPreview from './components/FacturaPreview';
import ComprobantePedido from './components/ComprobantePedido';
import { CartProvider } from './CartContext'; // <- importás el provider
import { AuthProvider } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './ProtectedRoute'; // Para las rutas protegidas

function App() {
  return (
    <Router>
      {/* CartProvider va por fuera: AuthProvider usa useCart() en su logout,
          así que necesita tener el contexto de carrito por encima. */}
      <CartProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/pago" element={
              <ProtectedRoute>
                <Pago />
              </ProtectedRoute>
            } />
            <Route path="/compras" element={
              <ProtectedRoute>
                <Compras />
              </ProtectedRoute>
            } />
            <Route path="/pedidos/:codigo" element={
              <ProtectedRoute>
                <DetallePedido />
              </ProtectedRoute>
            } />
            <Route path="/pedidos/:codigo/comprobante" element={
              <ProtectedRoute>
                <ComprobantePedido />
              </ProtectedRoute>
            } />
            <Route path="/facturas/:id" element={
              <ProtectedRoute>
                <FacturaPreview />
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer position="top-center" autoClose={3000} />
        </AuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
