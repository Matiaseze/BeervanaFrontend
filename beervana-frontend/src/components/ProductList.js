import React from 'react';
import { products } from '../data/products';
import { useCart } from '../CartContext';

function ProductList() {
  const { addToCart } = useCart();

  return (
    <div className="container mt-4">
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card text-white bg-dark h-100 position-relative shadow rounded">

              {/* Imagen */}
              <img
                src={product.image}
                className="card-img-top mx-auto"
                alt={product.name}
                style={{ width: '60%', height: 'auto', marginTop: '1rem' }}
              />

              <div className="card-body d-flex flex-column text-center">
                {/* Descripción */}
                <p className="text-warning small mb-1">
                  {product.description || 'Bomba de lúpulo / Turbia / Frutada'}
                </p>

                {/* Nombre */}
                <h5 className="card-title text-uppercase">{product.name}</h5>

                {/* Características */}
                <div className="d-flex justify-content-around text-white-50 my-3">
                  <div>
                    <div>🍋🍋🍋</div>
                    <small>MEDIO<br />Amargor</small>
                  </div>
                  <div>
                    <div>{product.alcohol || '6.6%'}</div>
                    <small>Alcohol</small>
                  </div>
                  <div>
                    <div>🧊🧊🧊🧊</div>
                    <small>MEDIO ALTO<br />Cuerpo</small>
                  </div>
                </div>

                {/* Botones */}
                <div className="mt-auto d-flex justify-content-around" title="Añadir al carrito">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => addToCart(product)}
                  >
                    ➕
                  </button>
                  <button className="btn btn-outline-light" title="Ver detalles">
                    👁
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
