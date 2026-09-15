import React from 'react';
import './SobreNosotros.css';
import Footer from '../components/Footer';

function SobreNosotros() {
  return (
    <>
    <div className="sobre-container">
      <div className="sobre-img" />
      <div className="sobre-texto">
        <h1>Sobre Nosotros</h1>
        <p>
          Somos Beervana, una tienda de cervezas artesanales e industriales con pasión por la calidad, la tradición y la experiencia cervecera.
          Nuestro objetivo es acercarte las mejores birras del país, apoyando a productores locales y celebrando la cultura cervecera con cada entrega.
        </p>
        <p>
          Creemos en la comunidad, en los buenos momentos compartidos, y en el sabor de lo auténtico. ¡Salud! 🍻
        </p>
        <h2 style={{ marginTop: '2rem' }}>Staff de Beervana</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><strong>Luciana Perez</strong></li>
        <li><strong>Matías Barea</strong></li>
        <li><strong>Rodrigo Arnaiz</strong></li>
        </ul>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default SobreNosotros;
