import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import { useCart } from '../CartContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ProductList() {
  const { addToCart } = useCart();
  const chocolate = '#7b4b32';
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);
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
                  src={product.image}
                  alt={product.name}
                  className="img-fluid"
                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                />
                <span
                  className="badge position-absolute top-0 end-0 m-2"
                  style={{ backgroundColor: chocolate, color: 'white' }}
                >
                  {product.alcohol || '6.6%'}
                </span>
              </div>
              <div className="card-body text-center">
                <p className="small mb-1" style={{ color: chocolate, opacity: 0.8 }}>
                  {product.description || 'Bomba de lúpulo / Turbia / Frutada'}
                </p>
                <h5 className="card-title" style={{ color: chocolate }}>
                  {product.name}
                </h5>
                <div className="d-flex justify-content-around my-3" style={{ color: chocolate, opacity: 0.8 }}>
                  <div>
                    <div>{'🍋'.repeat(product.bitterness || 3)}</div>
                    <small>MEDIO<br />Amargor</small>
                  </div>
                  <div>
                    <div>{product.alcohol || '6.6%'}</div>
                    <small>Alcohol</small>
                  </div>
                  <div>
                    <div>{'🧊'.repeat(product.body || 4)}</div>
                    <small>MEDIO ALTO<br />Cuerpo</small>
                  </div>
                </div>
                <div className="fw-bold fs-5" style={{ color: chocolate }}>
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 d-flex justify-content-evenly py-3">
                <button
                  className="btn"
                  style={{
                    backgroundColor: chocolate,
                    color: 'white',
                    border: `1.5px solid ${chocolate}`,
                    borderRadius: '5px',
                    padding: '0.35rem 1rem',
                    fontWeight: '600',
                  }}
                  onClick={() => addToCart(product)}
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
                <h5 className="modal-title">{selectedProduct.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedProduct(null)}
                />
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
                <p>{selectedProduct.description}</p>
                <p><strong>Alcohol:</strong> {selectedProduct.alcohol}</p>
                <p><strong>Amargor:</strong> {'🍋'.repeat(selectedProduct.bitterness || 3)}</p>
                <p><strong>Cuerpo:</strong> {'🧊'.repeat(selectedProduct.body || 4)}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cerrar</button>
                <button className="btn btn-primary" onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}>Agregar al carrito</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
