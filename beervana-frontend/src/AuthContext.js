import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from './services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { syncCartWithBackend, clearCart } = useCart();
  const navigate = useNavigate();

  // Verifica si hay token al iniciar
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Al iniciar sesión exitosamente
  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
  };

  // Al cerrar sesión
  const logout = async () => {
    try {
      const storedCart = localStorage.getItem('cart');
      const itemslocal = storedCart ? JSON.parse(storedCart) : [];

      if (itemslocal.length > 0) {
        await syncCartWithBackend(itemslocal);
      }

      await apiLogout();
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      clearCart(); // ✅ limpia memoria y estado del frontend
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

