import React, { createContext, useContext, useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from './services/auth';

const AuthContext = createContext();

// Lee el token en el primer render, no en un useEffect posterior.
// Si se hace en un efecto, el render inicial tiene user = null y ProtectedRoute
// alcanza a redirigir a /login antes de que el efecto corra: al recargar una
// ruta protegida te expulsaba aunque la sesión siguiera abierta.
const leerSesionGuardada = () => {
  const token = localStorage.getItem('token');
  return token ? { token } : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(leerSesionGuardada);
  const { syncCartWithBackend, clearCartLocal, fetchCart } = useCart();
  const navigate = useNavigate();

  // Al iniciar sesión exitosamente
  const login = async (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    // Traer el carrito guardado del usuario. CartProvider solo lo pide al
    // montarse, así que sin esto no aparecía hasta recargar la página.
    await fetchCart();
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
      // Limpieza solo local: el carrito recién sincronizado tiene que quedar
      // guardado en el backend para cuando el usuario vuelva a entrar.
      // (Antes se llamaba a clearCart(), que intenta vaciarlo en el server;
      // no lo borraba de casualidad, porque el token ya no estaba y daba 401.)
      clearCartLocal();
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

