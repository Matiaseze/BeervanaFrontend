import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  verCarrito,
  agregarAlCarrito,
  quitarDelCarrito,
  crearFactura
} from './services/carrito';
import { pagarFactura } from './services/factura';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await verCarrito();
      const items = res.data.items.map(item => ({
        id: item.cerveza.id,
        nombre: item.cerveza.nombre,
        descripcion: item.cerveza.descripcion,
        imagen_url: item.cerveza.imagen,
        precio: item.cerveza.precio,
        cantidad: item.cantidad,
      }));
      setCartItems(items);
    } catch (err) {
      console.error('Error al obtener el carrito', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (id, cantidad) => {
    await agregarAlCarrito(id, cantidad);
    await fetchCart();
  };

  const removeFromCart = async (id) => {
    await quitarDelCarrito(id);
    await fetchCart();
  };

  const clearCart = async () => {
    const promises = cartItems.map(item => quitarDelCarrito(item.id));
    await Promise.all(promises);
    await fetchCart();
  };

  const checkout = async () => {
    try {
      const res = await crearFactura(); // crea factura impaga
      return res.data.factura;
    } catch (error) {
      console.error('Error al generar la factura:', error);
      alert('No se pudo generar la factura');
      return null;
    }
  };

  const payInvoice = async (facturaId) => {
    try {
      await pagarFactura(facturaId);
      alert('¡Pago exitoso!');
      await fetchCart();
    } catch (error) {
      console.error('Error al pagar la factura:', error);
      alert('No se pudo procesar el pago');
    }
  };

  const handleCheckoutAndPay = async () => {
    try {
      const factura = await checkout();
      if (factura) {
        await payInvoice(factura.id);
        alert('¡Compra realizada con éxito!');
      }
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('No se pudo completar la compra');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        payInvoice,
        handleCheckoutAndPay, // ✅ nuevo método centralizado
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);