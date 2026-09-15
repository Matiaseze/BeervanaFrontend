import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { iniciarPagoMercadoPago, estadoPagoMercadoPago } from '../services/pedidos';

const AZUL_MP = '#009ee3';

/** Cada cuánto se le pregunta al backend si el pago entró. */
const CADA = 3000;

/** ~5 minutos. Después de eso, quedarse consultando no ayuda a nadie. */
const TOPE = 100;

/**
 * ¿Estamos en un celular?
 *
 * Importa porque cambia qué se le puede ofrecer: en el celular un QR no sirve,
 * nadie puede escanear su propia pantalla. Ahí lo que corresponde es mandarlo al
 * checkout, que si tiene la app de Mercado Pago instalada se abre en la app.
 *
 * Se mira el puntero y no el ancho de la ventana: una notebook con la ventana
 * angosta sigue siendo una computadora, y ahí el QR sí sirve.
 */
function esCelular() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;

  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

const estiloBotonPrimario = {
  borderRadius: '5px',
  border: `1.5px solid ${AZUL_MP}`,
  color: '#fff',
  backgroundColor: AZUL_MP,
  fontWeight: '600',
  padding: '0.5rem 1rem',
};

const estiloBotonSecundario = {
  borderRadius: '5px',
  border: `1.5px solid ${AZUL_MP}`,
  color: AZUL_MP,
  backgroundColor: 'transparent',
  fontWeight: '600',
  padding: '0.5rem 1rem',
};

/**
 * Pago con Mercado Pago: dos caminos, a elección del cliente.
 *
 *   QR          se muestra acá y se escanea con la app de MP desde el celular.
 *   Otro medio  se abre el checkout de MP en otra pestaña: tarjeta, dinero en
 *               cuenta, efectivo. Lo que MP ofrezca.
 *
 * Los dos cobran el mismo pedido y da igual por cuál entre la plata: el pago
 * vuelve etiquetado con el código. Por eso, elija lo que elija, esta pantalla
 * se queda esperando y avisa sola cuando se acredita. Esa espera no es un
 * lujo: en desarrollo no se le mandan back_urls a MP porque rechaza localhost,
 * así que el cliente NUNCA vuelve solo desde la otra pestaña.
 *
 * El cobro se pide al apretar un botón y NO al abrir la pantalla, porque una
 * caja de Mercado Pago tiene una sola orden activa por vez: si se disparara
 * solo, un cliente mirando su pedido le pisaría el QR al cajero que está
 * esperando que le paguen en el mostrador.
 */
function PagoMercadoPago({ codigo, deshabilitado }) {
  const navigate = useNavigate();

  const [pago, setPago] = useState(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [esperando, setEsperando] = useState(false);
  const [acreditado, setAcreditado] = useState(false);
  const [seCansó, setSeCansó] = useState(false);
  const [movil] = useState(esCelular);

  const reloj = useRef(null);
  const intentos = useRef(0);

  const dejarDeEsperar = useCallback(() => {
    if (reloj.current) {
      clearInterval(reloj.current);
      reloj.current = null;
    }
  }, []);

  // Si el componente se desmonta a mitad de la espera, el intervalo tiene que
  // morir con él: si no, sigue pegándole a la API sobre una pantalla que ya no
  // existe y React avisa de un setState sobre algo desmontado.
  useEffect(() => dejarDeEsperar, [dejarDeEsperar]);

  const empezarAEsperar = useCallback(() => {
    if (reloj.current) return;

    setEsperando(true);
    intentos.current = 0;

    reloj.current = setInterval(async () => {
      if (++intentos.current > TOPE) {
        dejarDeEsperar();
        setEsperando(false);
        setSeCansó(true);
        return;
      }

      try {
        const { data } = await estadoPagoMercadoPago(codigo);

        if (data?.pedido_estado === 'pagado') {
          dejarDeEsperar();
          setEsperando(false);
          setAcreditado(true);

          // Un momento para que se lea el "pago efectuado" antes de llevarlo a
          // la factura: un salto instantáneo se siente como que algo falló.
          setTimeout(() => {
            navigate(data.factura_id ? `/facturas/${data.factura_id}` : '/compras');
          }, 1800);

          return;
        }

        if (data?.pago?.estado === 'rechazado') {
          dejarDeEsperar();
          setEsperando(false);
          toast.error('Mercado Pago rechazó el pago. Podés intentar de nuevo.');
          setPago(null); // que pueda arrancar otro cobro
        }
      } catch (err) {
        // Un error de red suelto no corta la espera: puede ser un hipo y el
        // pago estar entrando igual.
        console.error('No se pudo consultar el estado del pago:', err);
      }
    }, CADA);
  }, [codigo, dejarDeEsperar, navigate]);

  /** Pide el cobro al backend, una sola vez por pedido. */
  const pedirCobro = async () => {
    // Dos cobros abiertos para el mismo pedido es la receta para que alguien
    // termine pagando dos veces: si ya está, se reusa.
    if (pago) return pago;

    const respuesta = await iniciarPagoMercadoPago(codigo);

    // La API devuelve { init_point, pago: { qr_data, init_point, estado… } }.
    // Lo que importa está adentro de `pago`: leerlo un nivel más arriba dejaba
    // el QR en undefined y el init_point andaba solo porque viene repetido.
    const datos = respuesta?.data?.pago ?? respuesta?.data ?? {};

    setPago(datos);

    return datos;
  };

  /** Abre el checkout de MP en otra pestaña, sin perder esta. */
  const abrirCheckout = (url, ventanaYaAbierta) => {
    // Si la pestaña ya se abrió en el click (para que no la mate el bloqueador
    // de popups), solo se le pone la dirección.
    if (ventanaYaAbierta) {
      ventanaYaAbierta.location.href = url;
      return true;
    }

    const nueva = window.open(url, '_blank', 'noopener');

    if (!nueva) {
      toast.info('Permitile a tu navegador abrir ventanas para pagar en otra pestaña.');
      return false;
    }

    return true;
  };

  const avisarError = (err) => {
    const datos = err.response?.data;
    toast.error(datos?.error || datos?.message || 'No se pudo iniciar el pago');
  };

  /** Camino 1: el QR en pantalla, para escanear con la app. */
  const pagarConQr = async () => {
    try {
      setPidiendo(true);
      const datos = await pedirCobro();

      if (!datos.qr_data) {
        // Sin caja configurada en MP no hay QR. No es un error para el
        // cliente: le queda el otro camino, y la espera se lo va a ofrecer.
        toast.info('El QR no está disponible ahora. Podés pagar con otro medio.');
      }

      empezarAEsperar();
    } catch (err) {
      avisarError(err);
    } finally {
      setPidiendo(false);
    }
  };

  /** Camino 2: el checkout de MP en otra pestaña. */
  const pagarConOtroMedio = async () => {
    // La pestaña se abre ACÁ, en el click, y recién después se pide el cobro.
    // Al revés no funciona: el await corta la cadena del gesto del usuario y
    // los bloqueadores de popups matan la ventana.
    const ventana = window.open('', '_blank');

    try {
      setPidiendo(true);
      const datos = await pedirCobro();

      if (!datos.init_point) {
        if (ventana) ventana.close();
        toast.error('Mercado Pago no devolvió un link de pago. Probá de nuevo.');
        return;
      }

      abrirCheckout(datos.init_point, ventana);
      empezarAEsperar();
    } catch (err) {
      if (ventana) ventana.close();
      avisarError(err);
    } finally {
      setPidiendo(false);
    }
  };

  // ── Pago acreditado ───────────────────────────────────────────────────────
  if (acreditado) {
    return (
      <div className="alert alert-success mb-3" role="status">
        <p className="fw-bold mb-1">¡Pago efectuado correctamente!</p>
        <p className="small mb-0">Te llevamos a tu factura...</p>
      </div>
    );
  }

  // ── Esperando que pague ───────────────────────────────────────────────────
  // Se muestran las dos vías aunque haya elegido una: si se arrepiente del QR
  // porque no tiene la app, el otro botón está ahí y cobra el mismo pedido.
  if (esperando) {
    return (
      <div
        className="mb-3 p-3 text-center"
        style={{ border: `1px solid ${AZUL_MP}`, borderRadius: '8px', background: '#fff' }}
      >
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <span className="spinner-border spinner-border-sm" style={{ color: AZUL_MP }} role="status" aria-hidden="true" />
          <span className="fw-semibold" style={{ color: AZUL_MP }}>Procesando tu pago...</span>
        </div>

        {pago?.qr_data && (
          <>
            <div className="d-inline-block p-2 bg-white rounded">
              {/* La trama que devuelve MP, no una URL: es lo que hace que la app
                  lo reconozca como un cobro. Nivel M de corrección porque la
                  trama es larga y con nivel alto queda tan denso que las cámaras
                  lo leen peor. */}
              <QRCodeSVG value={pago.qr_data} size={190} level="M" />
            </div>

            <p className="text-muted small mt-2 mb-3">
              Escanealo con la app de Mercado Pago.<br />
              El monto ya va en el código.
            </p>

            <p className="text-muted small mb-2">— o —</p>
          </>
        )}

        <button
          className="btn w-100"
          style={estiloBotonSecundario}
          onClick={() => abrirCheckout(pago?.init_point)}
          disabled={!pago?.init_point}
        >
          Pagar con otro medio
        </button>

        <p className="text-muted small mt-2 mb-0">
          {pago?.qr_data
            ? 'Tarjeta, dinero en cuenta o efectivo. Se abre Mercado Pago en otra pestaña.'
            : 'Terminá el pago en la otra pestaña. No cierres esta: te avisamos acá apenas se acredite.'}
        </p>
      </div>
    );
  }

  // ── Se dejó de consultar ──────────────────────────────────────────────────
  if (seCansó) {
    return (
      <div className="alert alert-warning mb-3">
        <p className="small mb-2">
          Dejamos de consultar. Si ya pagaste, tu compra aparece en «Compras».
        </p>
        <button className="btn btn-sm btn-outline-dark" onClick={() => navigate('/compras')}>
          Ir a mis compras
        </button>
      </div>
    );
  }

  // ── Todavía no arrancó: en el celular, un solo camino ─────────────────────
  if (movil) {
    return (
      <div className="mb-3">
        <button
          className="btn w-100"
          style={estiloBotonPrimario}
          onClick={pagarConOtroMedio}
          disabled={deshabilitado || pidiendo}
        >
          {pidiendo ? 'Preparando el pago...' : 'Pagar con Mercado Pago'}
        </button>

        <p className="text-muted small mt-2 mb-0">
          Se abre en otra pestaña. Si tenés la app instalada, se abre sola.
          Volvé acá y te avisamos cuando se acredite.
        </p>
      </div>
    );
  }

  // ── Todavía no arrancó: en computadora, las dos vías a la vista ───────────
  return (
    <div className="mb-3 d-grid gap-2">
      <button
        className="btn w-100"
        style={estiloBotonPrimario}
        onClick={pagarConQr}
        disabled={deshabilitado || pidiendo}
      >
        {pidiendo ? 'Preparando el pago...' : 'Pagar con QR'}
      </button>
      <p className="text-muted small mb-1">
        Te mostramos el código y lo escaneás con la app de Mercado Pago desde tu celular.
      </p>

      <button
        className="btn w-100"
        style={estiloBotonSecundario}
        onClick={pagarConOtroMedio}
        disabled={deshabilitado || pidiendo}
      >
        Pagar con otro medio
      </button>
      <p className="text-muted small mb-0">
        Tarjeta, dinero en cuenta o efectivo. Se abre Mercado Pago en otra pestaña
        y te avisamos acá cuando se acredite.
      </p>
    </div>
  );
}

export default PagoMercadoPago;
