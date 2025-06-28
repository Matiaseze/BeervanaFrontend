import React, { useEffect } from 'react';
import './Home.css';
import Footer from '../components/Footer';
import img1 from '../assets/carousel/slide1.jpg';
import img2 from '../assets/carousel/slide2.jpg';
import img0 from '../assets/carousel/slide3.jpg';
import rubiaImg from '../assets/cervezas/rubia.png';
import negraImg from '../assets/cervezas/negra.png';
import ipaImg from '../assets/cervezas/ipa.png';
import reparto from '../assets/reparto.png';
import fondo1 from '../assets/fondo1.jpeg';
import AOS from 'aos';
import 'aos/dist/aos.css';

const productosDestacados = [
  {
    id: 1,
    name: 'Cerveza Rubia',
    description: 'Refrescante, ligera y fácil de tomar',
    image: rubiaImg,
    amargor: '🍺',
    grado: '4.5%',
    cuerpo: '🧊🧊',
    amargorTexto: 'BAJO',
    cuerpoTexto: 'LIVIANO',
  },
  {
    id: 2,
    name: 'Cerveza Negra',
    description: 'Notas a café y chocolate, con mucho cuerpo',
    image: negraImg,
    amargor: '🍺🍺',
    grado: '6.8%',
    cuerpo: '🧊🧊🧊🧊🧊',
    amargorTexto: 'MEDIO',
    cuerpoTexto: 'ALTO',
  },
  {
    id: 3,
    name: 'Cerveza IPA',
    description: 'Intensa, cítrica y con amargor potente',
    image: ipaImg,
    amargor: '🍺🍺🍺🍺',
    grado: '6.6%',
    cuerpo: '🧊🧊🧊',
    amargorTexto: 'ALTO',
    cuerpoTexto: 'MEDIO',
  },
];


export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });

    const handleScroll = () => {
      AOS.refresh(); // mantiene el efecto al hacer scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Carrusel de bienvenida */}
      <div id="beervanaCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#beervanaCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#beervanaCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#beervanaCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src={img0}
              className="d-block w-100"
              alt="Slide 0"
              style={{ height: '600px', objectFit: 'cover' }}
            />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="fw-bold">Bienvenido a Beervana</h1>
              <p>Descubrí sabores únicos para cada ocasión</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src={img1}
              className="d-block w-100"
              alt="Slide 1"
              style={{ height: '600px', objectFit: 'cover' }}
            />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="fw-bold">Cervezas Artesanales</h1>
              <p>Elaboradas con pasión y tradición</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src={img2}
              className="d-block w-100"
              alt="Slide 2"
              style={{ height: '600px', objectFit: 'cover' }}
            />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="fw-bold">Sabores para Compartir</h1>
              <p>Para reuniones, momentos únicos y celebraciones</p>
            </div>
          </div>
        </div>
      </div>

    <div className="fondo-beervana">
      {/* Productos destacados */}
      <section className="container my-5">
        <h2 className="mb-4 text-center section-title">Productos Destacados</h2>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
          <div className="texto-destacado text-center" style={{ maxWidth: '400px', color: '#fdeebacc' }}>
            <h3 style={{ fontFamily: 'var(--font-main)', fontSize: '2rem' }}>
              ¡Estas birras vuelan como asado en domingo! 
            </h3>
            <p style={{ fontSize: '1.4rem' }}>
              Si no probás las más pedidas, ¿qué hacés con tu vida, hermano? 
             ¡Salud, que la birra fresca nunca falte! (y si falta… nosotros te la reponemos, pero apurate! 😉) 
            </p>
            <a href="/productos" className="btn local-btn mt-3">
              ¡Conseguilas acá!
            </a>
          </div>

          {/* Columna derecha - Carrusel */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div id="productosDestacadosCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
              <div className="carousel-inner">
                {productosDestacados.map((prod, index) => (
                  <div key={prod.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                    <div className="d-flex justify-content-center">
                      <div className="card destacada-card text-white text-center">
                        <img src={prod.image} className="producto-img mx-auto" alt={prod.name} />
                        <div className="card-body">
                          <p className="producto-descrip">{prod.description}</p>
                            <div className="producto-info mt-3">
                              <div>
                                <span role="img" aria-label="amargor">{prod.amargor}</span>
                                <p className="label">{prod.amargorTexto}<br /><small>Amargor</small></p>
                              </div>
                              <div>
                                <p className="grado">{prod.grado}</p>
                                <p className="label">Alcohol</p>
                              </div>
                              <div>
                                <span role="img" aria-label="cuerpo">{prod.cuerpo}</span>
                                <p className="label">{prod.cuerpoTexto}<br /><small>Cuerpo</small></p>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones del carrusel */}
              <button className="carousel-control-prev" type="button" data-bs-target="#productosDestacadosCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#productosDestacadosCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
              </button>

              {/* Indicadores */}
              <div className="carousel-indicators mt-3">
                {productosDestacados.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    data-bs-target="#productosDestacadosCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? 'active' : ''}
                    aria-current={index === 0}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Entregas */}
      <section className="entregas-container" data-aos="fade-right">
        <div className="entregas-texto">
          <h2 className="mb-4">🚚 Entregas rápidas y seguras</h2>
          <p>Hacemos envíos en Trelew y todo el país.</p>
          <p>Una vez confirmada tu compra, recibirás tu pedido dentro de <strong>24 a 48 horas si es en Trelew</strong>.</p>
          <p>Si sos de otra ciudad o provincia, recibirás tu pedido dentro de <strong>1 a 5 días</strong>.</p>
          <p>También podés <strong>retirar gratis</strong> en nuestro local.</p>
          <a
            href="https://www.google.com/maps/place/Universidad+Nacional+de+la+Patagonia+San+Juan+Bosco+-+Sede+Trelew/data=!4m2!3m1!1s0x0:0xc1b876370c365970?sa=X&ved=1t:2428&ictx=111"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-warning ms-2 local-btn"
            title="Estamos ahí por si necesitás stock urgente 👀"
            data-aos="zoom-in"
          >
            Visita Nuestro local
          </a>
        </div>
        <div className="entregas-imagen" data-aos="fade-left">
          <img src={reparto} alt="Reparto de cervezas" />
        </div>
      </section>
    </div>
      {/* Footer */}
      <Footer />
    </>
  );
}
