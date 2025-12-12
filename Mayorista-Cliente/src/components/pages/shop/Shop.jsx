import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FaInstagram } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "animate.css";

//cart
import { FiltersProvider } from "../../../context/filters.jsx";
import ProductList from "../cart/Cart/ProductList.jsx";
import Cart from "../cart/Cart/Cart.jsx";
import Filters from "../cart/Cart/Filters.jsx";
import Header from "../../header/Header.jsx";

//protected
import { isAdminOrSuperAdmin } from "../../../utils/auth.js";

//assets
import Granola from "../../../assets/img/granola.png";

//styles
import "./Shop.css";

const queryClient = new QueryClient();

const Shop = () => {
  const [showCartModal, setShowCartModal] = useState(false);
  const [search, setSearch] = useState(""); // <-- nuevo estado de búsqueda

  useEffect(() => {
    if (showCartModal) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
  }, [showCartModal]);

  localStorage.setItem("fromPage", "shop");

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // 👈 ajuste según tu breakpoint

    if (isMobile && !sessionStorage.getItem("filtersAlertShown")) {
      Swal.fire({
        title: "✨ Tip de búsqueda",
        html: `
        <p style="font-size:16px; color:#555;">
          Podés <b>filtrar</b> por 
          <span style="color:#4CAF50;">marca</span>, 
          <span style="color:#2196F3;">categoría</span> y 
          <span style="color:#FF9800;">precio</span> 
          para encontrar más fácil tus productos con solo apretar el carrito.
        </p>
      `,
        icon: "info",
        confirmButtonText: "¡Entendido!",
        confirmButtonColor: "#4CAF50",
        background: "#fdfdfd",
        color: "#333",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      sessionStorage.setItem("filtersAlertShown", "true");
    }
  }, []);

  return (
    <>
      <Header />

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
                  <h1 className="granola-title">
                    ¡Bienvenido a nuestra tienda!
                  </h1>
                  <p className="granola-description">
                    Aquí encontrarás una amplia variedad de productos para el
                    cuidado de nuestra salud.
                  </p>
                  <p>
                    Explora nuestras categorías y descubre lo mejor para
                    comenzar bien tu día.{" "}
                    <strong>¡Disfruta de la calidad!</strong>
                  </p>
                </div>
              </section>

              {isAdminOrSuperAdmin() && (
                <div className="classButtonAdd">
                  <Link to="/addProducts">Gestión de Productos</Link>
                </div>
              )}

              {/* Buscador */}
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar por producto o categoría.."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Lista de productos filtrada */}
              <div className="content">
                {/* Carrito arriba */}
              <div className="cart-top" id="cart-section">
  <Filters />
  <Cart />
  <div className="classButton">
    <Link to="/finish">Finalizar tu compra</Link>
  </div>
</div>

                {/* Lista de productos debajo */}
                <div className="products-wrapper">
                  <ProductList search={search} />
                </div>
              </div>
            </div>
          </main>

          {/* Botón flotante solo en móviles */}
        <button
  className="floating-cart-btn"
  onClick={() => {
    const cart = document.getElementById("cart-section");
    if (cart) {
      cart.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }}
>
  🛒
</button>

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
                  href="https://www.instagram.com/rubio.hnos"
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
