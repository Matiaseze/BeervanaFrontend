import api from './api';

export const obtenerFacturas = () => api.get('/facturas');

export const pagarFactura = (id) => api.post(`/facturas/${id}/pagar`);
