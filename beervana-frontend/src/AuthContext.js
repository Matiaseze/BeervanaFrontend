import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { syncCartWithBackend } = useCart();
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    } else {
      setUser(null);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
  };


const logout = async () => {
  try {
    const storedCart = localStorage.getItem('cart');
    const itemslocal = storedCart ? JSON.parse(storedCart) : [];
    await syncCartWithBackend(itemslocal); // ✅ sincroniza antes de logout
  } catch (error) {
    console.error("Error sincronizando antes de logout:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    navigate('/login');
  }
};

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
