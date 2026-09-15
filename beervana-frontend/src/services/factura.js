import api from './api';

// Historial de compras: solo ventas concretadas. Ya no existe "pagar factura":
// el pago se hace sobre el pedido y es lo que emite la factura.
export const obtenerFacturas = () => api.get('/facturas');

export const obtenerFactura = (id) => api.get(`/facturas/${id}`);
