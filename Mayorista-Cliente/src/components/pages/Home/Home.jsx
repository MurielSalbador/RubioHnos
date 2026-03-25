import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../../Mayorista-Server/src/hooks/serch/useProducts.js";
import { Products } from "../serch/productsList.jsx";
import { Link } from "react-router-dom";
import "./Home.css";
import backgroundHome from "../../../assets/background/backgroundHome.jpeg";
import { Container, Row, Col, Button, Card, Modal } from "react-bootstrap";
import { FaGithub, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

import CategoriesCarousel from "../Home/categoriesCarousel/CategoriesCarousel.jsx"; // o la ruta correcta

import Barrita from "../../../assets/img/barritaCereal.png"; // o la ruta correcta
import Header from "../../header/Header.jsx";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function Home() {
  const [search, setSearch] = useState("");
  const { products, getProducts, loading, loadMore, hasMore } = useProducts({
    search,
    sort: false,
  });

  const [userName, setUserName] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar si es mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  localStorage.setItem("fromPage", "home");

  useEffect(() => {
    getProducts({ search });
  }, [search, getProducts]);

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.username) {
          setUserName(parsedUser.username);
        }
      } catch (error) {
        console.error("Error al parsear el usuario:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products?limit=5`);
        const data = await response.json();
        setFeaturedProducts(data.docs || []);
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

const contacts = [
  { name: "Hernan", phone: "5493416863976", image: "https://ui-avatars.com/api/?name=Hernan" },
  { name: "Ruddi", phone: "5493416946454", image: "https://ui-avatars.com/api/?name=Ruddi" },
  { name: "Nacho", phone: "5493413916661", image: "https://ui-avatars.com/api/?name=Nacho" },
];

const openWhatsApp = (phone) => {
  window.open(`https://wa.me/${phone}`, "_blank");
};

  return (
    <div className="home-container">
      {/* HEADER */}

      <Header />

      <section
        className="home-hero-section"
        data-aos="fade-right"
        data-aos-duration="700"
        data-aos-delay="200"
      >
        <div className="mobile-quick-shop">
          <Link to="/shop">
            <button className="premium-mobile-btn">
              Ir a la Tienda ➔
            </button>
          </Link>
        </div>

        <div className="home-hero-content">
          {userName && (
            <h2 className="home-hero-welcome">
              ¡Bienvenid@, <strong>{userName}!</strong> a <strong>RUBIO</strong>
              <span className="space-between"> </span>
              <strong>hnos.</strong>
            </h2>
          )}

          <p className="home-hero-slogan">✨ Comé rico. Comé natural.</p>

          <div className="home-hero-tags">
            <p>
              🍵 <strong>Infusiones artesanales</strong>
            </p>
            <p>
              🌾 <strong>Productos sin TACC</strong>
            </p>
            <p>
              🍫 <strong>Snacks saludables y ricos</strong>
            </p>
          </div>
        </div>

        {!isMobile && (
          <img
            src={backgroundHome}
            alt="Mascota"
            className="home-hero-image"
            style={{ transform: "scaleX(1)" }}
            data-aos="fade-left"
            data-aos-duration="800"
          />
        )}
      </section>

      {!isMobile && (
        <Container fluid className="bg-light py-3">
          <Row className="text-center justify-content-center align-items-center">
            <Col
              xs={4}
              md={3}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <i className="fa-solid fa-truck-fast fa-2x text-dark"></i>
              <div>
                <strong>ENVÍOS A DOMICILIO</strong>
                <br />
                Sí, realizamos envíos a Rosario y alrededores con un costo
                adicional.
              </div>
            </Col>
            <Col
              xs={4}
              md={3}
              className="d-flex align-items-center justify-content-center gap-2 border-start border-end"
            >
              <i className="fa-solid fa-wheat-awn fa-2x text-success"></i>
              <div>
                <strong>+100 PRODUCTOS</strong>
                <br />
                Infusiones, sin TACC, snacks saludables
              </div>
            </Col>
            <Col
              xs={4}
              md={3}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <i className="fa-solid fa-envelope-open-text fa-2x text-warning"></i>
              <div>
                <strong>CONSULTAS PERSONALIZADAS</strong>
                <br />
                Escribinos para recibir asesoramiento
              </div>
            </Col>
          </Row>
        </Container>
      )}

      <section className="info-section">
        <div className="barrita-img">
          <img src={Barrita} alt="mate" className="hero-barrita" />
        </div>
        <div className="barrita-text">
          <h1 className="barrita-title">
            ¡Cuidamos tu bienestar de forma natural!
          </h1>
          <p className="barrita-description">
            Seleccionamos cada producto con amor y compromiso para que vos y tu
            familia puedan disfrutar de una vida más sana y consciente.
          </p>
          <p>
            Desde{" "}
            <strong>
              granolas artesanales, barritas energéticas, té natural, yerbas
              orgánicas
            </strong>{" "}
            hasta <strong> miel pura</strong> y mucho más… todo pensado para
            acompañarte día a día con lo mejor de la naturaleza.
          </p>
        </div>
        <div>
          {" "}
          <Link to="/contact">
            <button className="home-hero-button">Ver más información</button>
          </Link>
        </div>
      </section>

      <main className="main-content">
        <div className="main-wrapper">
          <section className="premium-search-container" data-aos="zoom-in">
            <div className="search-box-meta text-center mb-4">
              <h2 className="search-title">¿Qué estás buscando hoy?</h2>
              <p className="search-subtitle">Explorá nuestro catálogo de productos 100% naturales</p>
            </div>
            
            <div className="premium-input-group">
              <input
                type="text"
                className="premium-search-input"
                placeholder="Ej: Yerba Orgánica, Mix de Frutos..."
                value={search}
                onChange={handleInputChange}
                autoFocus
              />
              <div className="search-glow"></div>
            </div>
          </section>

          {search.trim() !== "" ? (
            <section className="product-list-results fade-in">
              <div className="results-info">
                 <p>Resultados para: <strong>"{search}"</strong></p>
              </div>
              <Products products={products} />
              {loading && (
                <div className="admin-loading py-5">
                   <div className="spinner-border text-success" role="status"></div>
                   <p className="mt-2">Buscando...</p>
                </div>
              )}
              
              {hasMore && !loading && products.length > 0 && (
                <div className="load-more-container mt-4 text-center">
                  <Button variant="outline-success" className="premium-load-btn" onClick={loadMore}>
                    Cargar más resultados
                  </Button>
                </div>
              )}

              {!loading && products.length === 0 && (
                <div className="no-results-home text-center py-5">
                   <p>No encontramos productos que coincidan con <strong>"{search}"</strong>.</p>
                   <p className="hint">Probá con términos más generales.</p>
                </div>
              )}
            </section>
          ) : (
            <section className="search-placeholder-home text-center py-5" data-aos="fade-up">
              <div className="placeholder-icon">🔎</div>
              <p>Escribí arriba para empezar a buscar tus productos favoritos</p>
            </section>
          )}
        </div>
      </main>

      {/* carrusel de marcas */}
      <section className="feature-showcase py-5 bg-light">
        <Container>
          <CategoriesCarousel />
        </Container>
      </section>

      {/* Productos destacados */}
      <section className="categories">
        <h3 className="section-title">Algunos de nuestros productos</h3>
        <div className="category-grid">
          {featuredProducts.slice(0, 5).map((product) => (
            <Link to={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="category-card">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="category-image"
                />
                <div className="category-title">{product.title}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="see-all-button-container">
          <a href="/shop" className="see-all-button">
            Ver todos
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo-container">
            <div className="footer-logo-text">
              <div className="logo-line-1">RubioHnos</div>
              <div className="logo-line-2">-Tienda Natural-</div>
            </div>
          </div>
          <div className="footer-info">
            <h3 className="footer-title">RubioHnos © 2025</h3>
            <p className="footer-text">
              Somos una tienda dedicada a la venta de productos naturales y
              saludables. Nuestro objetivo es ofrecer lo mejor para su
              bienestar.
            </p>
          </div>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/rubio.hnos?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </footer>

      {/* BOTÓN WHATSAPP */}
<div className="whatsapp-button" onClick={() => setShowWhatsAppModal(true)}>
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    alt="WhatsApp"
  />
</div>
{/* MODAL CONTACTOS WHATSAPP */}
<Modal
  show={showWhatsAppModal}
  onHide={() => setShowWhatsAppModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Contactos para WhatsApp</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {contacts.map((c) => (
      <div key={c.phone} className="wa-contact">
        <img src={c.image} alt={c.name} />
        <span>{c.name}</span>
        <Button variant="success" onClick={() => openWhatsApp(c.phone)}>
          Contactar
        </Button>
      </div>
    ))}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowWhatsAppModal(false)}>
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
}
