import api from './api';

export const verCarrito = () => api.get('/carrito');

export const agregarAlCarrito = (cerveza_id, cantidad) =>
  api.post('/carrito/agregar', { cerveza_id, cantidad });

export const quitarDelCarrito = (cerveza_id) =>
  api.delete(`/carrito/quitar/${cerveza_id}`);

export const crearFactura = () => api.post('/carrito/generar-factura');
