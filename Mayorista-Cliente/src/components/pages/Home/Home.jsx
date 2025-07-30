import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../../Mayorista-Server/src/hooks/serch/useProducts.js";
import { Products } from "../serch/productsList.jsx";
import { Link } from "react-router-dom";
import "./Home.css";
import backgroundHome from "../../../assets/background/backgroundHome.jpeg";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FaGithub, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

//account
import AccountButton from "../income/account/AccountButton.jsx";

//protected
import { isSuperAdmin } from "../../../utils/auth.js";

//corousel

import CategoriesCarousel from "../Home/categoriesCarousel/CategoriesCarousel.jsx"; // o la ruta correcta

import Barrita from "../../../assets/img/barritaCereal.png"; // o la ruta correcta


const API_URL= import.meta.env.VITE_BASE_SERVER_URL;


export default function Home() {
  const [search, setSearch] = useState("");
  const { products, getProducts, loading } = useProducts({
    search,
    sort: false,
  });

  //wellcome
  const [userName, setUserName] = useState("");

  //products
  const [featuredProducts, setFeaturedProducts] = useState([]);

  //redirigir a pages
  localStorage.setItem("fromPage", "home");

  useEffect(() => {
    getProducts({ search });
  }, [search, getProducts]);

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  //welcome
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

  //productos en bbdd
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        setFeaturedProducts(data.slice(0, 6));
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="home-container">
      {/* HEADER */}

      <header className="main-header">
        <div className="header-actions">
          <div className="nav-logo">
            <a
              href="/"
              className="logo-text"
              data-aos="fade-left"
              data-aos-duration="600"
              data-aos-delay="200"
            >
              <div className="logo-line-1">RubioHnos</div>
              <div className="logo-line-2">-Tienda Natural-</div>
            </a>
            
          </div>

          <ul className="nav-center">
            <li>
              <a href="/" className="link">
                <i className="fa-solid fa-house"></i> Home
              </a>
            </li>
            <li>
              <a href="/contact" className="link">
                <i className="fa-solid fa-envelope"></i> Contactanos
              </a>
            </li>
            <li>
              <a href="/shop" className="link">
                <i className="fa-solid fa-shop"></i> Tienda
              </a>
            </li>
            <li>
              <a href="/myOrders" className="link">
                <i className="fa-solid fa-envelope"></i> Pedidos
              </a>
            </li>
            {isSuperAdmin() && (
              <li>
                <a href="/httpClients" className="link">
                  <i className="fa-solid fa-envelope"></i> Clientes
                </a>
              </li>
            )}
          </ul>

          <ul className="nav-right">
            <li>
              <div className="link"></div>
            </li>
            <li>
              <a href="/cart" className="link">
                <i className="fa-solid fa-cart-shopping"></i> Mi carrito
              </a>
            </li>
            <li>
              <div className="link">
                <AccountButton />
              </div>
            </li>
          </ul>
        </div>
      </header>

      <section
        className="home-hero-section"
        data-aos="fade-right"
        data-aos-duration="700"
        data-aos-delay="200"
      >
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

          <Link to="/shop">
            <button className="home-hero-button">Ver productos</button>
          </Link>
        </div>

        <img
          src={backgroundHome}
          alt="Mascota"
          className="home-hero-image"
          style={{ transform: "scaleX(1)" }}
          data-aos="fade-left"
          data-aos-duration="800"
        />
      </section>

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
          <section className="search-bar">
            <h2>¿Qué está buscando?</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={handleInputChange}
              />
              <button>→</button>
            </div>
          </section>

          <section className="product-list">
            {loading ? <p>Loading...</p> : <Products products={products} />}
          </section>
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
            <div className="category-card" key={product._id}>
              <img
                src={`${API_URL}${product.imageUrl}`}
                alt={product.title}
                className="category-image"
              />
              <div className="category-title">{product.title}</div>
            </div>
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
    </div>
  );
}
