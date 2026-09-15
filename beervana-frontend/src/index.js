import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

// El CartProvider vive en App.js, envolviendo al AuthProvider.
// Si se lo agrega también acá quedan dos estados de carrito independientes.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
