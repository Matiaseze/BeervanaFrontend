import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'react-feather';
import { obtenerFactura } from '../services/factura';
import Footer from '../components/Footer';
import './FacturaPreview.css';

/**
 * Vista previa de la factura, con el mismo aspecto que va a tener impresa.
 *
 * El PDF se genera con el diálogo de impresión del navegador ("Guardar como
 * PDF"), no con una librería. Sale un PDF vectorial —texto seleccionable, no
 * una imagen— sin sumar dependencias, y el template es HTML/CSS común, fácil
 * de retocar. Los estilos de @media print en FacturaPreview.css esconden el
 * navbar, el footer y los botones.
 *
 * Si más adelante hace falta emitirla desde el servidor (por ejemplo para
 * mandarla por mail), el camino es dompdf en el backend reusando este mismo
 * diseño.
 */

// Datos del emisor. Cuando existan de verdad, salen de la configuración.
const EMISOR = {
  nombre: 'Beervana',
  descripcion: 'Cervezas artesanales',
  domicilio: 'Trelew, Chubut, Argentina',
  email: 'contacto@beervana.com',
  cuit: '30-00000000-0',
};

function FacturaPreview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    obtenerFactura(id)
      .then(res => { if (vigente) setFactura(res.data); })
      .catch(err => {
        console.error('No se pudo cargar la factura:', err);
        if (vigente) setError('No encontramos esa factura.');
      })
      .finally(() => { if (vigente) setCargando(false); });

    return () => { vigente = false; };
  }, [id]);

  if (cargando) {
    return (
      <div className="factura-fondo">
        <div className="container py-5 text-center">Cargando la factura...</div>
      </div>
    );
  }

  if (error || !factura) {
    return (
      <>
        <div className="factura-fondo">
          <div className="container py-5 text-center">
            <p style={{ color: '#7b4b32' }}>{error ?? 'No encontramos esa factura.'}</p>
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

  const items = factura.pedido?.items ?? [];
  const mercaderia = items.reduce((suma, item) => suma + parseFloat(item.subtotal), 0);
  const envio = parseFloat(factura.pedido?.envio ?? 0);
  const esRetiro = factura.pedido?.metodo_entrega === 'retiro';
  const numero = String(factura.id).padStart(8, '0');

  return (
    <>
      <div className="factura-fondo">
        <div className="container">
          {/* d-print-none es la utilidad de Bootstrap para esto y vive en su
              propio @media print, que se emite al final del bundle. Va además
              de la regla de FacturaPreview.css: dos mecanismos independientes
              para que los botones no salgan impresos. */}
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
              <Printer size={16} /> Exportar PDF
            </button>
          </div>

          <article className="factura-hoja">
            <header className="factura-encabezado">
              <div className="factura-emisor">
                <h1>{EMISOR.nombre}</h1>
                <p>{EMISOR.descripcion}</p>
                <p>{EMISOR.domicilio}</p>
                <p>{EMISOR.email}</p>
                <p>CUIT: {EMISOR.cuit}</p>
              </div>

              <div className="factura-comprobante">
                <div className="tipo">B</div>
                <p><strong>FACTURA</strong></p>
                <p>N.º {numero}</p>
                <p>Fecha: {new Date(factura.fecha).toLocaleDateString('es-AR')}</p>
              </div>
            </header>

            <section className="factura-bloques">
              <div className="factura-bloque">
                <h2>Cliente</h2>
                <p>{factura.user?.name ?? '—'}</p>
                <p>{factura.user?.email ?? ''}</p>
              </div>

              <div className="factura-bloque">
                <h2>Entrega</h2>
                <p>{esRetiro ? 'Retiro en el local' : 'Envío a domicilio'}</p>
                <p>Pedido N.º {factura.pedido?.id}</p>
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
                  <td>TOTAL</td>
                  <td>${parseFloat(factura.precio_total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <footer className="factura-pie">
              <p>Comprobante no válido como factura fiscal. Documento generado por Beervana.</p>
              <p>¡Gracias por tu compra!</p>
            </footer>
          </article>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FacturaPreview;
