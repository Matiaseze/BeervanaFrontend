import React from 'react';
import './Footer.css';
import logo from '../assets/Ber.png'; 

function Footer() {
  return (
    <footer className="footer-custom">
      <img src={logo} alt="Beervana Logo" height="100" className="footer-logo" />
      
      <div className="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-youtube"></i>
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-tiktok"></i>
        </a>
      </div>

      <div className="footer-links">
        <a href="https://docs.google.com/document/d/1WDDi6XGsK5L1VJSZ5RV_hC4OFw4ulezdRIrrC9KFBB0/edit?usp=sharing" target="_blank">Términos y Condiciones</a>
        <a href="https://www.privacypolicies.com/live/840b84b9-7fda-428b-b041-0e45ce994df9" target="_blank">Política de Privacidad</a>
        <a href="/sobre-nosotros">Información oficial de la compañía</a>
      </div>

      <p className="footer-warning">
        Beber con moderación. Prohibida su venta a menores de 18 años. No comparta el contenido con menores.
      </p>
      
      <small>© 2025 Beervana - Todos los derechos reservados</small>
    </footer>
  );
}

export default Footer;