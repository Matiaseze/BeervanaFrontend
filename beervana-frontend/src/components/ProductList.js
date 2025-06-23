// ProductList.js
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../services/api';
import { useCart } from '../CartContext';

function ProductList() {
  const chocolate = '#7b4b32';
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    AOS.init({ duration: 800 });
    api.get('/cervezas')
      .then((res) => setProducts(res.data))
      .catch((error) => console.error('Error al obtener cervezas:', error));
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
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

  return (
    <div className="container py-5">
      <div className="row g-4">
        {products.map((product) => (
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
                <span className="badge position-absolute top-0 end-0 m-2" style={{ backgroundColor: chocolate, color: 'white' }}>
                  {product.graduacion}%
                </span>
              </div>
              <div className="card-body text-center">
                <p className="small mb-1" style={{ color: chocolate, opacity: 0.8 }}>
                  {product.descripcion || 'Sin descripción'}
                </p>
                <h5 className="card-title" style={{ color: chocolate }}>{product.nombre}</h5>
                <div className="fw-bold fs-5" style={{ color: chocolate }}>{formatPrice(product.precio)}</div>
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
                <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cerrar</button>
                <button className="btn btn-primary" onClick={() => { addToCart(selectedProduct.id, 1); setSelectedProduct(null); }}>
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
