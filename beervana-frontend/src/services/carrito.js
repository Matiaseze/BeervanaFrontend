import api from './api';

export const verCarrito = () => api.get('/carrito');

export const sincronizarCarrito = (items) => api.post('/carrito/sincronizar', { items });

// POST, no DELETE: la ruta en Laravel es Route::post('/carrito/limpiar', ...).
// Con DELETE el backend respondía 405 y el carrito solo se limpiaba en el
// navegador, así que al recargar volvía a aparecer.
export const vaciarCarrito = () => api.post('/carrito/limpiar');

export const agregarAlCarrito = (cerveza_id, cantidad) =>
  api.post('/carrito/agregar', { cerveza_id, cantidad });

export const quitarDelCarrito = (cerveza_id) =>
  api.delete(`/carrito/quitar/${cerveza_id}`);

// metodo_entrega: 'envio' | 'retiro'. El backend decide cuánto cobra por el
// envío; acá solo se informa la opción elegida.
export const crearFactura = (items, metodoEntrega = 'envio') =>
  api.post('/carrito/generar-factura', { items, metodo_entrega: metodoEntrega });

// Costo del envío según el backend. No se hardcodea del lado del cliente para
// que el carrito no pueda mostrar un número distinto al que cobra la factura.
export const obtenerCostoEnvio = () => api.get('/costo-envio');