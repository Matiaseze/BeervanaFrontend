import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../CartContext';
import {
  obtenerPedido,
  cancelarPedido,
  confirmarPedido,
  estadoPagoMercadoPago,
} from '../services/pedidos';
import Footer from '../components/Footer';
import PagoMercadoPago from './PagoMercadoPago';

/**
 * Detalle de un pedido ya reservado, con las opciones de pago.
 *
 * Es la pantalla a la que llega el usuario después de confirmar el carrito, y
 * también a la que lo lleva el botón del Navbar cuando tiene un pedido
 * esperando pago. Por eso carga el pedido por id en vez de crearlo: /pago se
 * encarga de crearlo y redirige acá.
 */
function DetallePedido() {
  const chocolate = '#7b4b32';
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { refrescarPedidoPendiente } = useCart();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Mercado Pago devuelve al cliente con ?pago=exito|pendiente|fallo
  const [parametros, setParametros] = useSearchParams();
  const [verificandoPago, setVerificandoPago] = useState(false);

  useEffect(() => {
    let vigente = true;

    obtenerPedido(codigo)
      .then(res => { if (vigente) setPedido(res.data); })
      .catch(err => {
        console.error('No se pudo cargar el pedido:', err);
        if (vigente) setError('No encontramos ese pedido.');
      })
      .finally(() => { if (vigente) setCargando(false); });

    return () => { vigente = false; };
  }, [codigo]);

  /**
   * Vuelta desde el checkout de Mercado Pago.
   *
   * No alcanza con leer ?pago=exito y creerle: ese parámetro lo pone MP en la
   * URL del navegador y cualquiera puede escribirlo a mano. Lo que decide es lo
   * que responde nuestro backend, que a su vez le pregunta a MP.
   *
   * Se consulta varias veces porque la acreditación no es instantánea: el
   * cliente puede volver antes de que MP termine de procesar, y una sola
   * consulta lo dejaría viendo "pendiente" sobre un pago que sí entró.
   */
  useEffect(() => {
    const resultado = parametros.get('pago');

    if (!resultado) return;

    // Se saca de la URL enseguida: si queda, un F5 vuelve a disparar todo esto
    // y el cliente ve los mismos avisos de nuevo sin haber hecho nada.
    setParametros({}, { replace: true });

    if (resultado === 'fallo') {
      toast.error('El pago no se pudo completar. Podés intentar de nuevo.');
      return;
    }

    let vigente = true;
    let intentos = 0;
    setVerificandoPago(true);

    const consultar = async () => {
      if (!vigente) return;

      try {
        const { data } = await estadoPagoMercadoPago(codigo);

        if (!vigente) return;

        if (data.pedido_estado === 'pagado') {
          setVerificandoPago(false);
          toast.success('¡Pago acreditado! Ya podés ver tu factura.');
          await refrescarPedidoPendiente();
          navigate('/compras');
          return;
        }

        if (data.pago?.estado === 'rechazado') {
          setVerificandoPago(false);
          toast.error('Mercado Pago rechazó el pago. Podés intentar de nuevo.');
          return;
        }

        // Hasta seis vueltas (unos 12 segundos). Más que eso es tenerlo mirando
        // un spinner: mejor decirle que se acredita solo y dejarlo seguir.
        if (++intentos < 6) {
          setTimeout(consultar, 2000);
          return;
        }

        setVerificandoPago(false);
        toast.info('El pago está en proceso. Te avisamos en «Compras» cuando se acredite.');
      } catch (err) {
        if (!vigente) return;
        setVerificandoPago(false);
        console.error('No se pudo verificar el pago:', err);
      }
    };

    consultar();

    return () => { vigente = false; };
  }, [codigo, parametros, setParametros, navigate, refrescarPedidoPendiente]);

  // El cobro es presencial: acá solo se emite el comprobante que el cliente
  // lleva al local. La factura se emite cuando el cajero cobra, no antes.
  //
  // Se avisa al backend para que el mostrador distinga a quien va a venir de
  // quien dejó el pedido armado sin decidir nada.
  const handlePagarEnElLocal = async () => {
    try {
      setProcesando(true);
      await confirmarPedido(pedido.codigo);
      navigate(`/pedidos/${pedido.codigo}/comprobante`);
    } catch (err) {
      const datos = err.response?.data;
      toast.error(datos?.error || datos?.message || 'No se pudo confirmar el pedido');
    } finally {
      setProcesando(false);
    }
  };

  const handlePagarDespues = () => {
    toast.info('Tu pedido quedó reservado. Podés pagarlo desde «Compras».');
    navigate('/compras');
  };

  const handleCancelar = async () => {
    try {
      setProcesando(true);
      await cancelarPedido(pedido.codigo);
      await refrescarPedidoPendiente();
      toast.success('Pedido cancelado. Los productos vuelven a estar disponibles.');
      navigate('/productos');
    } catch (err) {
      const datos = err.response?.data;
      toast.error(datos?.error || datos?.message || 'No se pudo cancelar el pedido');
    } finally {
      setProcesando(false);
    }
  };

  const fondo = {
    background: 'linear-gradient(to right,rgb(223, 184, 145),rgb(231, 190, 152))',
    minHeight: '100vh',
    padding: '2rem',
  };

  if (cargando) {
    return (
      <div style={fondo}>
        <div className="container py-5 text-center">Cargando tu pedido...</div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <>
        <div style={fondo}>
          <div className="container py-5 text-center">
            <p style={{ color: chocolate }}>{error ?? 'No encontramos ese pedido.'}</p>
            <button
              className="btn"
              style={{ border: `2px solid ${chocolate}`, color: chocolate }}
              onClick={() => navigate('/compras')}
            >
              Ir a mis compras
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const mercaderia = pedido.items.reduce((suma, item) => suma + parseFloat(item.subtotal), 0);
  const venceEl = pedido.expira_en ? new Date(pedido.expira_en) : null;
  // Un pedido ya confirmado sigue mostrando las opciones: el cliente puede
  // volver a imprimir su comprobante o cancelarlo.
  const sePuedePagar = ['pendiente', 'confirmado'].includes(pedido.estado);

  return (
    <>
      <div style={fondo}>
        <div className="container py-5">
          <h2 className="mb-2">Confirmá tu pedido</h2>
          <p className="text-muted mb-4">Pedido {pedido.codigo}</p>

          {sePuedePagar ? (
            <div className="alert" style={{ backgroundColor: '#fdf7ee', border: `1px solid ${chocolate}`, color: chocolate }}>
              <strong>Ya reservamos tus productos.</strong>{' '}
              {venceEl && <>La reserva vale hasta el <strong>{venceEl.toLocaleString()}</strong>. </>}
              Podés pagar ahora o dejarlo pendiente y pagarlo desde «Compras».
            </div>
          ) : (
            <div className="alert alert-secondary">
              Este pedido ya no está pendiente de pago (estado: {pedido.estado}).
            </div>
          )}

          <div className="card mb-4">
            <div className="card-body">
              <table className="table table-bordered" style={{ backgroundColor: '#fdf7ee' }}>
                <thead style={{ backgroundColor: chocolate, color: 'white' }}>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.cerveza.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                      <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-end mt-3">
                <p className="mb-1">Mercadería: ${mercaderia.toFixed(2)}</p>
                <p className="mb-1">
                  {pedido.metodo_entrega === 'retiro'
                    ? 'Retiro en el local: sin cargo'
                    : `Envío a domicilio: $${parseFloat(pedido.envio ?? 0).toFixed(2)}`}
                </p>
                <h5 className="mt-2">Total: ${parseFloat(pedido.precio_total).toFixed(2)}</h5>
              </div>
            </div>
          </div>

          {sePuedePagar && (
            <>
              <h4>Seleccioná un método de pago:</h4>
              <p className="text-muted">
                Con «Pagar en el local» generamos un comprobante con el código de tu
                pedido. Presentalo en el mostrador para abonar: ahí te emitimos la
                factura. El pedido queda reservado hasta entonces.
              </p>
              <div className="d-flex gap-3 mb-4 flex-wrap">
                <button
                  className="btn"
                  style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }}
                  onClick={handlePagarEnElLocal}
                  disabled={procesando}
                >
                  Pagar en el local
                </button>

                <button
                  className="btn"
                  style={{
                    borderRadius: '5px',
                    border: `1.5px solid ${chocolate}`,
                    color: chocolate,
                    backgroundColor: 'transparent',
                    fontWeight: '600',
                    padding: '0.35rem 1rem',
                  }}
                  onClick={handlePagarDespues}
                  disabled={procesando}
                >
                  Pagar después
                </button>

              </div>

              {verificandoPago ? (
                <p className="text-muted mb-4">
                  Estamos confirmando tu pago con Mercado Pago...
                </p>
              ) : (
                <>
                  <p className="text-muted mb-3">
                    O pagalo ahora con billetera virtual y retiralo sin pasar por la caja.
                  </p>

                  {/* El QR o el botón, según el dispositivo: en el celular un
                      código QR no sirve porque nadie escanea su propia pantalla. */}
                  <div style={{ maxWidth: '22rem' }}>
                    <PagoMercadoPago codigo={pedido.codigo} deshabilitado={procesando} />
                  </div>
                </>
              )}

              <button className="btn btn-link text-danger p-0" onClick={handleCancelar} disabled={procesando}>
                Cancelar este pedido y liberar los productos
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default DetallePedido;
