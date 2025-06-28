import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../services/api';
import { useCart } from '../CartContext';
import { Trash2 } from 'react-feather';
import Footer from '../components/Footer';

function ProductList() {
  const chocolate = '#7b4b32';
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [estiloFilter, setEstiloFilter] = useState('');
  const [envaseFilter, setEnvaseFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [cantidades, setCantidades] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { addToCart } = useCart();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = {};
        const response = await api.get('/cervezas', { params });
        setProducts(response.data);
        setAllProducts(response.data);  // Todos los productos originales
        setCurrentPage(1);
      } catch (error) {
        console.error('Error al obtener cervezas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtrados = allProducts;

    if (marcaFilter) {
      filtrados = filtrados.filter(p => p.marca?.id?.toString() === marcaFilter);
    }
    if (estiloFilter) {
      filtrados = filtrados.filter(p => p.estilo?.id?.toString() === estiloFilter);
    }
    if (search.trim() !== '') {
      filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
    }

    setProducts(filtrados);
  }, [marcaFilter, estiloFilter, search, allProducts]);

  const marcasDisponibles = [...new Map(allProducts.map(p => [p.marca?.id, p.marca])).values()].filter(Boolean);
  const estilosDisponibles = [...new Map(allProducts.map(p => [p.estilo?.id, p.estilo])).values()].filter(Boolean);
  const envases = [...new Set(products.map(p => p.tipo_envase).filter(Boolean))];



  const handleCantidadChange = (productId, value, stock) => {
    // Solo permitir números enteros positivos hasta el stock
    const cantidad = parseInt(value, 10);
    if (!isNaN(cantidad) && cantidad >= 0 && cantidad <= stock) {
      setCantidades(prev => ({ ...prev, [productId]: cantidad }));
    }
  };


  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);

  const handleAgregar = async (product) => {
    await addToCart(product, cantidades[product.id] || 1);
  };


  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(search.toLowerCase()) &&
    (envaseFilter === '' || product.tipo_envase === envaseFilter)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
                style={{ border: `1.5px solid ${chocolate}`, color: chocolate }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" style={{ border: `1.5px solid ${chocolate}`, color: chocolate }} value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)}>
                <option value="">Todas las marcas</option>
                {marcasDisponibles.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" style={{ border: `1.5px solid ${chocolate}`, color: chocolate }} value={estiloFilter} onChange={(e) => setEstiloFilter(e.target.value)}>
                <option value="">Todos los estilos</option>
                {estilosDisponibles.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-center gap-2">
              <select className="form-select w-100" style={{ border: `1.5px solid ${chocolate}`, color: chocolate }} value={envaseFilter} onChange={(e) => setEnvaseFilter(e.target.value)}>
                <option value="">Todos los envases</option>
                {envases.map((env, i) => (
                  <option key={i} value={env}>{env}</option>
                ))}
              </select>
              <button className="btn btn-sm btn-outline-secondary" onClick={limpiarFiltros} style={{ color: chocolate, borderColor: chocolate, padding: '4px 6px' }} title="Limpiar filtros">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Cargando */}
          {isLoading ? (
            <div className="text-center py-5 fs-4 text-muted">Cargando productos...</div>
          ) : (
            <>
              {/* Productos */}
              <div className="row g-4">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="col-sm-6 col-lg-4" data-aos="fade-up">
                    <div className="card bg-white h-100 rounded-4" style={{
                      border: `2px solid ${chocolate}`,
                      color: chocolate,
                      boxShadow: '0 2px 6px rgba(123, 75, 50, 0.15)',
                      transition: 'box-shadow 0.3s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(123, 75, 50, 0.4)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(123, 75, 50, 0.15)'}
                    >
                      <div className="position-relative text-center bg-light rounded-top py-3">
                        <img src={product.imagen} alt={product.nombre} className="img-fluid" style={{ maxHeight: '180px', objectFit: 'contain' }} />
                        {product.estilo && (
                          <p className="card-title" style={{ color: chocolate, margin: '0.25rem 0' }}>
                            Estilo: {product.estilo.nombre}
                          </p>
                        )}
                        <span className="badge position-absolute top-0 end-0 m-2" style={{ backgroundColor: chocolate, color: 'white' }}>
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
                        <h5 className="card-title" style={{ color: chocolate }}>{product.nombre}</h5>
                        <div className="fw-bold fs-5" style={{ color: chocolate }}>
                          {formatPrice(product.precio)}
                        </div>
                      </div>

                      <div className="card-footer bg-transparent border-top-0 d-flex flex-column align-items-center py-3">
                        {/* Input de cantidad */}
                        <div className="d-flex align-items-center mb-2">
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={cantidades[product.id] || 1}
                            onChange={(e) => handleCantidadChange(product.id, e.target.value, product.stock)}
                            className="form-control form-control-sm"
                            style={{ width: '70px', marginRight: '0.5rem' }}
                          />
                          <span>Unidades</span>
                        </div>

                        {/* Botones */}
                        <div className="d-flex gap-2">
                          <button
                            className="btn"
                            style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }}
                            onClick={() => {
                              const cantidad = cantidades[product.id] || 1;
                              if (cantidad > 0 && cantidad <= product.stock) {
                                handleAgregar(product, cantidad);
                              } else {
                                alert('Cantidad inválida');
                              }
                            }}
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
                  </div>
                ))}
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2">
                  <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    Anterior
                  </button>
                  <span className="align-self-center">Página {currentPage} de {totalPages}</span>
                  <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal de detalles (sin cambios) */}
          {selectedProduct && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ border: `2px solid ${chocolate}` }}>
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedProduct.nombre}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)} />
                  </div>
                  <div className="modal-body text-center">
                    <img src={selectedProduct.imagen} alt={selectedProduct.nombre} className="img-fluid mb-3" style={{ maxHeight: '200px', objectFit: 'contain' }} />
                    <p>{selectedProduct.descripcion}</p>
                    <p><strong>Alcohol:</strong> {selectedProduct.graduacion}%</p>
                    <p><strong>Amargor:</strong> {selectedProduct.ibu}</p>
                    <p><strong>Envase:</strong> {selectedProduct.tipo_envase}</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn" style={{
                      borderRadius: '5px',
                      border: `1.5px solid ${chocolate}`,
                      color: chocolate,
                      backgroundColor: 'transparent',
                      fontWeight: '600',
                      padding: '0.35rem 1rem',
                    }} onClick={() => setSelectedProduct(null)}>Cerrar</button>
                    <button className="btn" style={{ backgroundColor: chocolate, color: 'white', border: `1.5px solid ${chocolate}` }} onClick={() => {
                      addToCart(selectedProduct.id, 1);
                      setSelectedProduct(null);
                    }}>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductList;
