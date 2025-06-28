import React, { createContext, useContext, useEffect, useState } from 'react';
import { sincronizarCarrito, verCarrito } from './services/carrito';
import { crearFactura } from './services/carrito';
import { pagarFactura } from './services/factura';
import { vaciarCarrito } from './services/carrito';
import { toast } from 'react-toastify';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  
  const [cartItems, setCartItems] = useState([]);
  

  // Cargar carrito desde la API al iniciar sesión (solo si no hay en localStorage)
  const fetchCart = async () => {
    try {
      const res = await verCarrito();
      console.log("DEBUG res de verCarrito:", res);
      const items = res.data.items.map(item => ({
        id: item.cerveza.id,
        nombre: item.cerveza.nombre,
        descripcion: item.cerveza.descripcion,
        imagen_url: item.cerveza.imagen,
        precio: item.cerveza.precio,
        cantidad: item.cantidad,
        stock: item.cerveza.stock
      }));
      setCartItems(items);
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
      console.log(err);
      console.error('Error al obtener el carrito desde la API', err);
    }
  };

  // Inicializar desde localStorage o backend
useEffect(() => {
  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchCart();
    } else {
      const cachedCart = localStorage.getItem('cart');
      if (cachedCart) {
        try {
          const parsedCart = JSON.parse(cachedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        } catch (err) {
          console.error("Error al parsear carrito local:", err);
        }
      }
    }
  };

  loadCart();
}, []); // Solo ejecuta cuando AuthProvider está inicializado

  // Guardar en localStorage al cambiar carrito
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

 const addToCart = (producto, cantidad = 1) => {
  const currentCart = [...cartItems];
  const index = currentCart.findIndex(item => item.id === producto.id);

  if (index !== -1) {
    const nuevoTotal = currentCart[index].cantidad + cantidad;

    if (nuevoTotal > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    currentCart[index].cantidad = nuevoTotal;
  } else {
    if (cantidad > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    currentCart.push({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen_url: producto.imagen_url ?? producto.imagen, // según cómo venga
      precio: producto.precio,
      cantidad,
      stock: producto.stock
    });
  }

  setCartItems(currentCart);
  toast.success('Producto agregado al carrito');
};

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

const clearCart = async () => {
  try {
    await vaciarCarrito(); // ✅ vacía en backend
  } catch (error) {
    console.error("Error al vaciar el carrito en backend:", error);
  } finally {
    localStorage.removeItem('cart'); // ✅ limpia local
    setCartItems([]);               // ✅ limpia estado en memoria
  }
};

  const checkout = async () => {
    try {
      const res = await crearFactura(cartItems);
      return res.data.factura;
    } catch (error) {
      console.log(error);
      console.error('Error al generar la factura:', error);
      return null;
    }
  };

  const payInvoice = async (facturaId) => {
    try {
      await pagarFactura(facturaId);
      alert('¡Pago exitoso!');
      clearCart();
    } catch (error) {
      console.error('Error al pagar la factura:', error);
      alert('No se pudo procesar el pago');
    }
  };

  // Sincronización al cerrar pestaña
const syncCartWithBackend = async (itemslocal) => {
  try {
    if (!itemslocal || itemslocal.length === 0) {
      console.log("No hay ítems para sincronizar.");
      return;
    }

    const items = itemslocal.map(item => ({
      cerveza_id: item.id,
      cantidad: item.cantidad
    }));
    
    await sincronizarCarrito(items); 
  } catch (err) {
    console.error('Error al sincronizar el carrito con el backend:', err);
  }
};

  // Evento al cerrar la pestaña
useEffect(() => {
  const handleBeforeUnload = () => {
    const itemslocal = JSON.parse(localStorage.getItem('cart') || '[]');
    syncCartWithBackend(itemslocal);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        payInvoice,
        fetchCart,
        syncCartWithBackend

      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);
