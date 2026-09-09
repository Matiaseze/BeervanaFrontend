import api from './api';

// Crear el pedido reserva el stock. El backend decide el costo del envío y los
// precios; desde acá solo se informan los ítems y el método de entrega.
export const crearPedido = (items, metodoEntrega = 'envio') =>
  api.post('/pedidos', {
    items: items.map(item => ({ id: item.id, cantidad: item.cantidad })),
    metodo_entrega: metodoEntrega,
  });

export const listarPedidos = () => api.get('/pedidos');

// Se direccionan por código y no por id: el id es secuencial y se puede
// recorrer a mano desde la barra del navegador.
export const obtenerPedido = (codigo) => api.get(`/pedidos/${codigo}`);

// Libera la reserva antes de que venza
export const cancelarPedido = (codigo) => api.post(`/pedidos/${codigo}/cancelar`);

// El cliente avisa que va a pagarlo en el local. No cobra nada: solo deja
// constancia para que el mostrador sepa que alguien va a venir.
export const confirmarPedido = (codigo) => api.post(`/pedidos/${codigo}/confirmar`);

// ── Mostrador (solo personal) ───────────────────────────────────────────────
// El cobro es presencial, así que registrarlo no es una acción del cliente:
// si lo fuera, marcaría su propio pedido como pagado sin pagar. El backend
// responde 403 a quien no sea del personal.

// Busca el pedido por el código que el cliente trae impreso
export const buscarPedidoPorCodigo = (codigo) =>
  api.get('/mostrador/pedido', { params: { codigo } });

// Registra el cobro: descuenta el stock y emite la factura
export const cobrarPedido = (id) => api.post(`/mostrador/pedidos/${id}/cobrar`);

// ── Mercado Pago ────────────────────────────────────────────────────────────

// Arranca el pago y devuelve init_point: la URL del checkout de MP a la que hay
// que mandar al cliente. No se abre en pestaña nueva a propósito, porque los
// bloqueadores de popups la matan y el cliente se queda sin saber qué pasó.
export const iniciarPagoMercadoPago = (codigo) =>
  api.post(`/pedidos/${codigo}/mercadopago`);

// Estado del pago consultado contra MP. Se llama al volver del checkout: el
// webhook puede no haber llegado todavía (en local ni siquiera existe, porque
// MP no puede alcanzar localhost), y sin esto el cliente vuelve a una pantalla
// que sigue diciendo "pendiente" aunque acabe de pagar.
export const estadoPagoMercadoPago = (codigo) =>
  api.get(`/pedidos/${codigo}/pago`);
