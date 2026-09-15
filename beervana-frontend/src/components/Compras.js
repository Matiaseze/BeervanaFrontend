import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText } from 'react-feather';
import { toast } from 'react-toastify';
import { listarPedidos, cancelarPedido } from '../services/pedidos';
import { obtenerFacturas } from '../services/factura';
import { useCart } from '../CartContext';
import Footer from '../components/Footer';

const chocolate = '#7b4b32';

const ETIQUETA_ESTADO = {
  pendiente: { texto: 'Sin confirmar', clase: 'bg-secondary' },
  confirmado: { texto: 'Esperando pago en el local', clase: 'bg-warning text-dark' },
  pagado: { texto: 'Pagado', clase: 'bg-success' },
  cancelado: { texto: 'Cancelado', clase: 'bg-secondary' },
  vencido: { texto: 'Reserva vencida', clase: 'bg-danger' },
};

function Compras() {
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const navigate = useNavigate();
  // Para que el botón del Navbar deje de ofrecer un pedido que ya se resolvió
  const { refrescarPedidoPendiente } = useCart();

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const [resPedidos, resFacturas] = await Promise.all([listarPedidos(), obtenerFacturas()]);
      setPedidos(resPedidos.data);
      setFacturas(resFacturas.data);
    } catch (err) {
      console.error('No se pudieron cargar las compras:', err);
      setError('No pudimos cargar tus compras.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleCancelar = async (pedido) => {
    try {
      setProcesando(pedido.id);
      await cancelarPedido(pedido.codigo);
      toast.success('Tu Pedido fue cancelado');
      await Promise.all([cargar(), refrescarPedidoPendiente()]);
    } catch (err) {
      const datos = err.response?.data;
      toast.error(datos?.error || datos?.message || 'No se pudo cancelar el pedido');
    } finally {
      setProcesando(null);
    }
  };

  // Solo los pendientes vigentes se pueden pagar o cancelar. El backend informa
  // como 'vencido' un pendiente cuya reserva ya caducó, aunque en la base siga
  // figurando pendiente.
  const pendientes = pedidos.filter((p) => ['pendiente', 'confirmado'].includes(p.estado));
  const historial = pedidos.filter(
    (p) => !['pendiente', 'confirmado', 'pagado'].includes(p.estado)
  );

  const fondo = { background: 'linear-gradient(to right,rgb(218, 178, 139), #e7caae)', minHeight: '100vh', padding: '2rem' };

  if (cargando) {
    return (
      <div style={fondo}>
        <div className="container py-5 text-center">Cargando tus compras...</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div style={fondo}>
          <div className="container py-5 text-center">
            <p style={{ color: chocolate }}>{error}</p>
            <button className="btn" style={{ border: `2px solid ${chocolate}`, color: chocolate }} onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div style={fondo}>
        <div className="container py-5">
          <h2 className="mb-4" style={{ color: chocolate }}>Mis compras</h2>

          {/* ── Pedidos esperando pago ─────────────────────────────────── */}
          {pendientes.length > 0 && (
            <section className="mb-5">
              <h4 className="d-flex align-items-center gap-2" style={{ color: chocolate }}>
                <Package size={20} /> Pedidos pendientes de pago
              </h4>
              <p className="text-muted">
                Atencion: Los productos de estos pedidos se reservan por un tiempo limitado.
                Si no los pagas antes de que caduque la reserva, el pedido se cancelará automáticamente.
                Para abonar, presentá el comprobante con su código en el local.
              </p>

              {pendientes.map((pedido) => (
                <div key={pedido.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h6 className="mb-1">Pedido {pedido.codigo}</h6>
                        <span className={`badge ${ETIQUETA_ESTADO[pedido.estado].clase}`}>
                          {ETIQUETA_ESTADO[pedido.estado].texto}
                        </span>
                        {pedido.expira_en && (
                          <small className="d-block text-muted mt-1">
                            Vence el {new Date(pedido.expira_en).toLocaleString()}
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-5">${parseFloat(pedido.precio_total).toFixed(2)}</div>
                        <small className="text-muted">
                          {pedido.metodo_entrega === 'retiro' ? 'Retiro en el local' : 'Envío a domicilio'}
                        </small>
                      </div>
                    </div>

                    <ul className="list-unstyled mt-3 mb-3">
                      {pedido.items.map((item) => (
                        <li key={item.id}>
                          {item.cantidad} × {item.cerveza.nombre} — ${parseFloat(item.subtotal).toFixed(2)}
                        </li>
                      ))}
                    </ul>

                    <div className="d-flex gap-2">
                      <button
                        className="btn"
                        style={{ backgroundColor: chocolate, color: 'white' }}
                        onClick={() => navigate(`/pedidos/${pedido.codigo}/comprobante`)}
                        disabled={procesando === pedido.id}
                      >
                        Ver comprobante
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleCancelar(pedido)}
                        disabled={procesando === pedido.id}
                      >
                        Cancelar pedido
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ── Facturas: compras concretadas ──────────────────────────── */}
          <section className="mb-5">
            <h4 className="d-flex align-items-center gap-2" style={{ color: chocolate }}>
              <FileText size={20} /> Compras realizadas
            </h4>

            {facturas.length === 0 ? (
              <div className="text-center py-4">
                <p style={{ color: chocolate }}>Todavía no hiciste ninguna compra.</p>
                <button
                  className="btn"
                  style={{ border: `2px solid ${chocolate}`, color: chocolate }}
                  onClick={() => navigate('/productos')}
                >
                  Ver productos
                </button>
              </div>
            ) : (
              facturas.map((factura) => (
                <div key={factura.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h6 className="mb-1">Factura #{factura.id}</h6>
                        <small className="text-muted">
                          {new Date(factura.fecha).toLocaleDateString()} ·{' '}
                          {factura.pedido?.metodo_entrega === 'retiro'
                            ? 'Retiro en el local'
                            : 'Envío a domicilio'}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-5">
                          ${parseFloat(factura.precio_total).toFixed(2)}
                        </div>
                        <button
                          className="btn btn-sm btn-link p-0"
                          style={{ color: chocolate }}
                          onClick={() => navigate(`/facturas/${factura.id}`)}
                        >
                          Ver factura
                        </button>
                      </div>
                    </div>

                    <ul className="list-unstyled mt-3 mb-0">
                      {(factura.pedido?.items ?? []).map((item) => (
                        <li key={item.id}>
                          {item.cantidad} × {item.cerveza.nombre} — ${parseFloat(item.subtotal).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* ── Pedidos que no llegaron a concretarse ──────────────────── */}
          {historial.length > 0 && (
            <section>
              <h5 style={{ color: chocolate }}>Pedidos cancelados o vencidos</h5>
              <ul className="list-group">
                {historial.map((pedido) => (
                  <li key={pedido.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      Pedido #{pedido.id} · ${parseFloat(pedido.precio_total).toFixed(2)}
                    </span>
                    <span className={`badge ${ETIQUETA_ESTADO[pedido.estado].clase}`}>
                      {ETIQUETA_ESTADO[pedido.estado].texto}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Compras;
