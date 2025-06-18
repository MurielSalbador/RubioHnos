import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FaGithub, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

//cart
import { FiltersProvider } from "../../../context/filters.jsx";
import ProductList from "../cart/Cart/ProductList.jsx";
import Cart from "../cart/Cart/Cart.jsx";
import Filters from "../cart/Cart/Filters.jsx";

//protected
import { isAdminOrSuperAdmin, isSuperAdmin } from "../../../utils/auth.js";

//account
import AccountButton from "../income/account/AccountButton.jsx";

//assets
import Granola from "../../../assets/img/granola.png";

//styles
import "./Shop.css";

const queryClient = new QueryClient();

const Shop = () => {
  const [showCart, setShowCart] = useState(false);

  //boton cerrar redirija a shop cuando esta en shop
  localStorage.setItem("fromPage", "shop");
  <Link to="/cart" state={{ from: "shop" }}>
    🛒 Mi carrito
  </Link>;

  return (
    <>
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
              <div className="logo-line-1">PetCare</div>
              <div className="logo-line-2">Shop</div>
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
                  <i className="fa-solid fa-envelope"></i> Usuarios
                </a>
              </li>
            )}
          </ul>

          <ul className="nav-right">
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

      <QueryClientProvider client={queryClient}>
        <FiltersProvider>
          <main
            className="main"
            data-aos="zoom-in"
            data-aos-duration="600"
            data-aos-delay="200"
          >
            <div className="container">
              <section className="granola-section">
                <div className="granola-img">
                  <img src={Granola} alt="mate" className="hero-granola" />
                </div>
                <div className="granola-text">
                  <h1 className="granola-title">¡Bienvenido a nuestra tienda!</h1>
                  <p className="granola-description">
                    Aquí encontrarás una amplia variedad de productos para el cuidado de nuestra salud.
                  </p>
                  <p>
                    Explora nuestras categorías y descubre lo mejor para comenzar bien tu día. <strong>¡Disfruta de la calidad!</strong>
                  </p>
                </div>
              </section>

              {isAdminOrSuperAdmin() && (
                <div className="classButtonAdd">
                  <Link to="/addProducts">Gestión de Productos</Link>
                </div>
              )}

              <div className="content">
                <div className="products-wrapper">
                  <ProductList />
                </div>
                <div className="cart">
                  <div>
                    <Filters />
                  </div>
                  <Cart />
                  <div className="classButton">
                    <Link to="/finish">Finalizar tu compra</Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

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
        </FiltersProvider>
      </QueryClientProvider>

      
    </>
  );
};

export default Shop;
