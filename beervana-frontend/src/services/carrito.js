import api from './api';

export const verCarrito = () => api.get('/carrito');

export const sincronizarCarrito = (items) => api.post('/carrito/sincronizar', { items });

export const vaciarCarrito = () => api.delete('/carrito/vaciar');

export const agregarAlCarrito = (cerveza_id, cantidad) =>
  api.post('/carrito/agregar', { cerveza_id, cantidad });

export const quitarDelCarrito = (cerveza_id) =>
  api.delete(`/carrito/quitar/${cerveza_id}`);

export const crearFactura = (items) =>
  api.post('/carrito/generar-factura', { items });