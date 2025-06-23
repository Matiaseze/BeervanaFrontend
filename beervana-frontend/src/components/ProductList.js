// ProductList.js
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../services/api';
import { useCart } from '../CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'react-feather';
import Footer from '../components/Footer';



function ProductList() {
  const chocolate = '#7b4b32';
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [estiloFilter, setEstiloFilter] = useState('');
  const [envaseFilter, setEnvaseFilter] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [estilos, setEstilos] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [marcasRes, estilosRes] = await Promise.all([
          api.get('/marcas'),
          api.get('/estilos'),
        ]);
        setMarcas(marcasRes.data);
        setEstilos(estilosRes.data);
      } catch (error) {
        console.error('Error al cargar marcas o estilos:', error);
      }
    };
    fetchFilters();
  }, []);

  // cargo cervezas con filtros
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (marcaFilter) params.marca_id = marcaFilter;
        if (estiloFilter) params.estilo_id = estiloFilter;
        console.log('Filtros enviados:', params);
        const response = await api.get('/cervezas', { params });
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener cervezas:', error);
      }
    };
    fetchProducts();
  }, [marcaFilter, estiloFilter]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);

  const handleAgregar = async (product) => {
    const input = prompt(`¿Cuántas unidades de "${product.nombre}" querés agregar?`, '1');
    const cantidad = parseInt(input);
    if (!isNaN(cantidad) && cantidad > 0) {
      await addToCart(product.id, cantidad);
    } else {
      alert('Cantidad inválida');
    }
  };

  // extraigo envases desde las cervezas cargadas
  const envases = [...new Set(products.map(p => p.tipo_envase).filter(Boolean))];

  // Filtro final: busqueda por nombre + filtro envase
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(search.toLowerCase()) &&
    (envaseFilter === '' || product.tipo_envase === envaseFilter)
  );
  
  const limpiarFiltros = () => {
  setSearch('');
  setMarcaFilter('');
  setEstiloFilter('');
  setEnvaseFilter('');
  };
  return (
  <>
  <div style={{ background: 'linear-gradient(to right, #e0bc98, #e7caae)', minHeight: '100vh', padding: '2rem' }}>
    <div className="container py-5"> 
      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control placeholder-chocolate"
            placeholder="Buscar por nombre..."
            style={{
              border: `1.5px solid ${chocolate}`,
              color: chocolate
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            style={{
              border: `1.5px solid ${chocolate}`,
              color: chocolate
            }}
            value={marcaFilter}
            onChange={(e) => setMarcaFilter(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            style={{
              border: `1.5px solid ${chocolate}`,
              color: chocolate
            }}
            value={estiloFilter}
            onChange={(e) => setEstiloFilter(e.target.value)}
          >
            <option value="">Todos los estilos</option>
            {estilos.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-center gap-2">
          <select
            className="form-select w-100"
            style={{
              border: `1.5px solid ${chocolate}`,
              color: chocolate
            }}
            value={envaseFilter}
            onChange={(e) => setEnvaseFilter(e.target.value)}
          >
            <option value="">Todos los envases</option>
            {envases.map((env, i) => (
              <option key={i} value={env}>{env}</option>
            ))}
          </select>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={limpiarFiltros}
            style={{ color: chocolate, borderColor: chocolate, padding: '4px 6px' }}
            title="Limpiar filtros"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Productos */}
      <div className="row g-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="col-sm-6 col-lg-4" data-aos="fade-up">
            <div
              className="card bg-white h-100 rounded-4"
              style={{
                border: `2px solid ${chocolate}`,
                color: chocolate,
                boxShadow: '0 2px 6px rgba(123, 75, 50, 0.15)',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(123, 75, 50, 0.4)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(123, 75, 50, 0.15)'}
            >
              <div className="position-relative text-center bg-light rounded-top py-3">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="img-fluid"
                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                />
                {/* Muestra estilo si esta disponible */}
                  {product.estilo && (
                    <p className="card-title" style={{ color: chocolate, margin: '0.25rem 0' }}>
                      Estilo: {product.estilo.nombre}
                    </p>
                  )}
                <span
                  className="badge position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: chocolate, color: 'white' }}
                >
                  {product.graduacion}%
                </span>
                {/* Muestra stock si esta disponible */}
                  {typeof product.stock !== 'undefined' && (
                    <p className="card-title" style={{ color: chocolate, margin: '0.25rem 0' }}>
                      Stock: {product.stock}
                    </p>
                  )}
              </div>
              <div className="card-body text-center">
                 {/* <p className="small mb-1" style={{ color: chocolate, opacity: 0.8 }}>
                  {product.descripcion || 'Sin descripción'}
                </p>*/}
                <h5 className="card-title" style={{ color: chocolate }}>{product.nombre}</h5>
                <div className="fw-bold fs-5" style={{ color: chocolate }}>
                  {formatPrice(product.precio)}
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 d-flex justify-content-evenly py-3">
                <button
                  className="btn"
                  style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }}
                  onClick={() => handleAgregar(product)}
                >
                  + Agregar
                </button>
                <button
                  className="btn"
                  title="Ver detalles"
                  style={{
                    borderRadius: '5px',
                    border: `1.5px solid ${chocolate}`,
                    color: chocolate,
                    backgroundColor: 'transparent',
                    fontWeight: '600',
                    padding: '0.35rem 1rem',
                  }}
                  onClick={() => setSelectedProduct(product)}
                >
                  Ver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalles */}
      {selectedProduct && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ border: `2px solid ${chocolate}` }}>
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.nombre}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)} />
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedProduct.imagen}
                  alt={selectedProduct.nombre}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
                <p>{selectedProduct.descripcion}</p>
                <p><strong>Alcohol:</strong> {selectedProduct.graduacion}%</p>
                <p><strong>Amargor:</strong> {selectedProduct.ibu}</p>
                <p><strong>Envase:</strong> {selectedProduct.tipo_envase}</p>
              </div>
              <div className="modal-footer">
                <button className="btn"
                  style={{
                    borderRadius: '5px',
                    border: `1.5px solid ${chocolate}`,
                    color: chocolate,
                    backgroundColor: 'transparent',
                    fontWeight: '600',
                    padding: '0.35rem 1rem',
                  }}
                onClick={() => setSelectedProduct(null)}>Cerrar</button>
                <button
                  className="btn"
                  style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }}
                  onClick={() => {
                    addToCart(selectedProduct.id, 1);
                    setSelectedProduct(null);
                  }}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  {/* Footer */}
        <Footer />
  </>
  );
}

export default ProductList;
