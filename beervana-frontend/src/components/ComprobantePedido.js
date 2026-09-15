import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Printer, ArrowLeft } from 'react-feather';
import { obtenerPedido } from '../services/pedidos';
import Footer from '../components/Footer';
import './FacturaPreview.css';

/**
 * Comprobante que el cliente imprime o descarga para pagar en el local.
 *
 * NO es la factura: la factura se emite cuando el cajero cobra. Emitirla antes
 * sería volver al problema de tener comprobantes de ventas que nunca ocurrieron.
 * Este papel solo dice "reservé esto, vengo a pagarlo", y lo que lo vuelve
 * verificable es el código del pedido.
 */

const EMISOR = {
  nombre: 'Beervana',
  descripcion: 'Cervezas artesanales',
  domicilio: 'Trelew, Chubut, Argentina',
  email: 'contacto@beervana.com',
};

function ComprobantePedido() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    obtenerPedido(codigo)
      .then(res => {
        if (! vigente) return;

        // El comprobante sirve para ir a pagar. Si el pedido ya se cobró, se
        // canceló o venció, no hay nada que presentar: se saca de pantalla en
        // vez de dejarlo accesible recargando la página.
        if (! ['pendiente', 'confirmado'].includes(res.data.estado)) {
          const motivo = res.data.estado === 'pagado'
            ? 'Ese pedido ya fue pagado. Su factura está en «Compras».'
            : `Ese pedido ya no está vigente (${res.data.estado}).`;
          toast.info(motivo);
          navigate('/compras', { replace: true });
          return;
        }

        setPedido(res.data);
      })
      .catch(err => {
        console.error('No se pudo cargar el pedido:', err);
        if (vigente) setError('No encontramos ese pedido.');
      })
      .finally(() => { if (vigente) setCargando(false); });

    return () => { vigente = false; };
  }, [codigo, navigate]);

  if (cargando) {
    return (
      <div className="factura-fondo">
        <div className="container py-5 text-center">Cargando tu comprobante...</div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <>
        <div className="factura-fondo">
          <div className="container py-5 text-center">
            <p style={{ color: '#7b4b32' }}>{error ?? 'No encontramos ese pedido.'}</p>
            <button
              className="btn"
              style={{ border: '2px solid #7b4b32', color: '#7b4b32' }}
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

  const items = pedido.items ?? [];
  const mercaderia = items.reduce((suma, item) => suma + parseFloat(item.subtotal), 0);
  const envio = parseFloat(pedido.envio ?? 0);
  const esRetiro = pedido.metodo_entrega === 'retiro';
  const venceEl = pedido.expira_en ? new Date(pedido.expira_en) : null;

  return (
    <>
      <div className="factura-fondo">
        <div className="container">
          <div className="factura-acciones d-print-none d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <button
              className="btn d-flex align-items-center gap-2"
              style={{ border: '2px solid #7b4b32', color: '#7b4b32' }}
              onClick={() => navigate('/compras')}
            >
              <ArrowLeft size={16} /> Volver a mis compras
            </button>

            <button
              className="btn d-flex align-items-center gap-2"
              style={{ backgroundColor: '#7b4b32', color: 'white' }}
              onClick={() => window.print()}
            >
              <Printer size={16} /> Descargar / imprimir
            </button>
          </div>

          <article className="factura-hoja">
            <header className="factura-encabezado">
              <div className="factura-emisor">
                <h1>{EMISOR.nombre}</h1>
                <p>{EMISOR.descripcion}</p>
                <p>{EMISOR.domicilio}</p>
                <p>{EMISOR.email}</p>
              </div>

              <div className="factura-comprobante">
                <div className="tipo">P</div>
                <p><strong>COMPROBANTE DE PEDIDO</strong></p>
                <p>Pedido {pedido.codigo}</p>
              </div>
            </header>


            <section className="factura-bloques">
              <div className="factura-bloque">
                <h2>Cliente</h2>
                <p>{pedido.user?.name ?? '—'}</p>
                <p>{pedido.user?.email ?? ''}</p>
              </div>

              <div className="factura-bloque">
                <h2>Entrega</h2>
                <p>{esRetiro ? 'Retiro en el local' : 'Envío a domicilio'}</p>
                {venceEl && <p>Reservado hasta el {venceEl.toLocaleString('es-AR')}</p>}
              </div>
            </section>

            <table className="factura-items">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="num">Cant.</th>
                  <th className="num">P. unitario</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.cerveza.nombre}</td>
                    <td className="num">{item.cantidad}</td>
                    <td className="num">${parseFloat(item.precio_unitario).toFixed(2)}</td>
                    <td className="num">${parseFloat(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="factura-totales">
              <tbody>
                <tr>
                  <td>Mercadería</td>
                  <td>${mercaderia.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>{esRetiro ? 'Retiro en el local' : 'Envío a domicilio'}</td>
                  <td>${envio.toFixed(2)}</td>
                </tr>
                <tr className="total">
                  <td>A PAGAR</td>
                  <td>${parseFloat(pedido.precio_total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Al pie: es lo que el cajero busca para saber qué está cobrando.
                Las barras se dibujan con CSS a partir del propio código, sin
                sumar una librería. No es un simbolismo estándar (no lo lee un
                lector láser), pero da la referencia visual y el código impreso
                debajo es el que se tipea. */}
            <section className="comprobante-codigo">
              <span>Código para el mostrador</span>
              <div className="barras" aria-hidden="true">
                {pedido.codigo.replace('-', '').split('').map((caracter, i) => (
                  <i key={i} style={{ width: `${1 + (caracter.charCodeAt(0) % 3)}px` }} />
                ))}
              </div>
              <strong>{pedido.codigo}</strong>
            </section>

            <footer className="factura-pie">
              <p>
                <strong>Este comprobante no es una factura y no acredita el pago.</strong>{' '}
                Presentalo en el local para abonar; ahí se emite la factura.
              </p>
              {venceEl && (
                <p>La reserva de los productos vence el {venceEl.toLocaleString('es-AR')}.</p>
              )}
            </footer>
          </article>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ComprobantePedido;
