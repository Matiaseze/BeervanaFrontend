import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { sincronizarCarrito, verCarrito } from './services/carrito';
import { obtenerCostoEnvio } from './services/carrito';
import { crearPedido, listarPedidos } from './services/pedidos';
import { vaciarCarrito } from './services/carrito';
import { toast } from 'react-toastify';
const CartContext = createContext();

// Forma que espera POST /carrito/sincronizar.
// Va fuera del componente: es pura y no necesita nada del render. Adentro se
// recreaba en cada uno, volvía inestable a fetchCart y eso hacía saltar
// react-hooks/exhaustive-deps.
const aPayload = (items) =>
  items.map(item => ({ cerveza_id: item.id, cantidad: item.cantidad }));

export const CartProvider = ({ children }) => {
  
  const [cartItems, setCartItems] = useState([]);

  // Recién después de la carga inicial empezamos a guardar en el backend, para
  // no re-enviar lo que acabamos de traer.
  const cargaInicialLista = useRef(false);
  // Misma idea pero como estado, para que los componentes puedan esperar.
  // Sin esto, un carrito con ítems se ve vacío durante el primer render y
  // pantallas como /pago toman decisiones sobre información incompleta.
  const [cartCargado, setCartCargado] = useState(false);
  // Última versión que el backend ya tiene, para no mandar cambios repetidos.
  const ultimoPersistido = useRef(null);

  // Envío a domicilio o retiro en el local. La elección se hace en el carrito y
  // la usa /pago al generar la factura, por eso vive acá y no en el componente.
  const [metodoEntrega, setMetodoEntrega] = useState('envio');
  // Lo dicta el backend (GET /costo-envio): así el carrito no puede mostrar un
  // número distinto al que termina cobrando la factura.
  const [costoEnvio, setCostoEnvio] = useState(null);

  useEffect(() => {
    obtenerCostoEnvio()
      .then(res => setCostoEnvio(Number(res.data.costo_envio)))
      .catch(err => console.error('No se pudo obtener el costo de envío:', err));
  }, []);

  // Pedido reservado esperando pago, si hay alguno. El Navbar lo usa para
  // mandar al detalle del pedido en vez de al carrito, que quedó vacío al
  // generarlo. Si hay más de uno, el más reciente (la API los ordena desc).
  const [pedidoPendiente, setPedidoPendiente] = useState(null);

  const refrescarPedidoPendiente = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setPedidoPendiente(null);
      return;
    }

    try {
      const res = await listarPedidos();
      setPedidoPendiente(res.data.find(p => p.estado === 'pendiente') ?? null);
    } catch (err) {
      console.error('No se pudo consultar los pedidos pendientes:', err);
    }
  }, []);

  useEffect(() => {
    refrescarPedidoPendiente();
  }, [refrescarPedidoPendiente]);

  // Cargar carrito desde la API al iniciar sesión (solo si no hay en localStorage)
  const fetchCart = async () => {
    try {
      const res = await verCarrito();
      const items = res.data.items.map(item => ({
        id: item.cerveza.id,
        nombre: item.cerveza.nombre,
        descripcion: item.cerveza.descripcion,
        imagen_url: item.cerveza.imagen,
        precio: item.cerveza.precio,
        cantidad: item.cantidad,
        stock: item.cerveza.stock
      }));
      setCartItems(items);
      localStorage.setItem('cart', JSON.stringify(items));
      // Lo que acabamos de traer ya está en el backend: no hay que reenviarlo.
      ultimoPersistido.current = JSON.stringify(aPayload(items));
    } catch (err) {
      console.error('Error al obtener el carrito desde la API', err);
    }
  };

  // Inicializar desde localStorage o backend
useEffect(() => {
  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchCart();
    } else {
      const cachedCart = localStorage.getItem('cart');
      if (cachedCart) {
        try {
          const parsedCart = JSON.parse(cachedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        } catch (err) {
          console.error("Error al parsear carrito local:", err);
        }
      }
    }
  };

  loadCart().finally(() => {
    cargaInicialLista.current = true;
    setCartCargado(true);
  });
}, []); // Solo ejecuta cuando AuthProvider está inicializado

  // Guardar en localStorage al cambiar carrito
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Guardar en el backend apenas cambia el carrito, sin esperar al logout ni al
  // cierre de pestaña. Se agrupan los cambios seguidos (los clicks en +/-) para
  // no mandar un request por click.
  useEffect(() => {
    if (!cargaInicialLista.current) return;
    if (!localStorage.getItem('token')) return; // invitado: solo localStorage

    const payload = aPayload(cartItems);
    const serializado = JSON.stringify(payload);
    if (serializado === ultimoPersistido.current) return;

    const temporizador = setTimeout(async () => {
      try {
        // /carrito/sincronizar rechaza la lista vacía con un 400, así que para
        // vaciar hay que usar la otra ruta.
        if (payload.length === 0) {
          await vaciarCarrito();
        } else {
          await sincronizarCarrito(payload);
        }
        ultimoPersistido.current = serializado;
      } catch (err) {
        console.error('No se pudo guardar el carrito en el backend:', err);
      }
    }, 400);

    return () => clearTimeout(temporizador);
  }, [cartItems]);

 const addToCart = (producto, cantidad = 1) => {
  const currentCart = [...cartItems];
  const index = currentCart.findIndex(item => item.id === producto.id);

  if (index !== -1) {
    const nuevoTotal = currentCart[index].cantidad + cantidad;

    if (nuevoTotal > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    currentCart[index].cantidad = nuevoTotal;
  } else {
    if (cantidad > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    currentCart.push({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen_url: producto.imagen_url ?? producto.imagen, // según cómo venga
      precio: producto.precio,
      cantidad,
      stock: producto.stock
    });
  }

  setCartItems(currentCart);
  toast.success('Producto agregado al carrito');
};

  const removeFromCart = (id) => { 
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

// Limpia solo el navegador y deja intacto el carrito guardado en el backend.
// Es lo que corresponde al cerrar sesión: el carrito tiene que seguir ahí
// cuando el usuario vuelva a entrar.
const clearCartLocal = () => {
  localStorage.removeItem('cart');
  setCartItems([]);
};

const clearCart = async () => {
  try {
    await vaciarCarrito(); // vacía en backend
    // Ya quedó vacío del lado del server: que el efecto de guardado no lo repita.
    ultimoPersistido.current = '[]';
  } catch (error) {
    console.error("Error al vaciar el carrito en backend:", error);
  } finally {
    localStorage.removeItem('cart'); // limpia local
    setCartItems([]);               // limpia estado en memoria
  }
};

  // Crea el pedido y reserva el stock. Todavía no hay factura ni cobro.
  // No captura el error: quien llama necesita distinguir "no hay stock" (409)
  // de un problema de red, y mostrar el motivo real que devolvió el backend.
  const crearPedidoDelCarrito = async () => {
    const res = await crearPedido(cartItems, metodoEntrega);

    // El carrito ya se convirtió en pedido: vaciarlo también en el backend.
    // Si quedara con los mismos ítems, el usuario podría generar un segundo
    // pedido por lo mismo y reservar el doble de stock.
    await clearCart();
    await refrescarPedidoPendiente();

    return res.data.pedido;
  };

  // Sincronización al cerrar pestaña
const syncCartWithBackend = async (itemslocal) => {
  try {
    if (!itemslocal || itemslocal.length === 0) {
      return;
    }

    const items = itemslocal.map(item => ({
      cerveza_id: item.id,
      cantidad: item.cantidad
    }));
    
    await sincronizarCarrito(items); 
  } catch (err) {
    console.error('Error al sincronizar el carrito con el backend:', err);
  }
};

  // Evento al cerrar la pestaña
useEffect(() => {
  const handleBeforeUnload = () => {
    const itemslocal = JSON.parse(localStorage.getItem('cart') || '[]');
    syncCartWithBackend(itemslocal);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCargado,
        metodoEntrega,
        setMetodoEntrega,
        costoEnvio,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        clearCartLocal,
        crearPedidoDelCarrito,
        pedidoPendiente,
        refrescarPedidoPendiente,
        fetchCart,
        syncCartWithBackend

      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);
