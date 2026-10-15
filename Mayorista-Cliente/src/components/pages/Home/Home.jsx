import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaInstagram, FaWhatsapp, FaArrowRight, FaTruck, FaLeaf, FaComments, FaSearch } from "react-icons/fa";

import Header from "../../header/Header.jsx";
import ProductCard from "../cart/Cart/ProductCard.jsx";
import ProductModal from "../cart/Cart/ProductModal.jsx";
import SkeletonCard from "../cart/Cart/SkeletonCard.jsx";
import CartBar from "../cart/Cart/CartBar.jsx";
import ServerWaking from "../../ServerWaking/ServerWaking.jsx";
import BrandsMarquee from "./categoriesCarousel/CategoriesCarousel.jsx";
import { getAllProducts } from "../../../api/fakeStoreApi.js";
import { getCategories } from "../../../api/categoriesApi.js";
import { PRODUCT_TAGS } from "../../../utils/productTags.js";

import Barrita from "../../../assets/img/barritaCereal.webp";
import HomePhoto from "../../../assets/background/backgroundHome.webp";

import "../cart/Cart/ProductList.css";
import "../cart/Cart/SkeletonCard.css";
import "../shop/Shop.css";
import "./Home.css";

const CONTACTS = [
  { name: "Hernan", phone: "5493416863976" },
  { name: "Ruddi", phone: "5493416946454" },
  { name: "Nacho", phone: "5493413916661" },
];

const CATEGORY_EMOJIS = ["🥣", "🍯", "🌾", "🍵", "🥜", "🍫", "🧉", "🍪", "🥗", "🍎"];

function getUserName() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.username || "";
  } catch {
    return "";
  }
}

export default function Home() {
  const userName = getUserName();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [selected, setSelected] = useState(null);
  const handleOpen = useCallback((p) => setSelected(p), []);

  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getAllProducts({ page: 1, limit: 8 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
  });

  const featuredProducts = featured?.docs || [];

  return (
    <div className="home-container">
      <Header />

      {/* ---------- Portada ---------- */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <motion.div
            className="home-hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="home-eyebrow">
              {userName ? `¡Hola, ${userName}! 👋` : "🌿 Tienda natural en Rosario y zona"}
            </span>
            <h1>
              Comé rico.
              <br />
              <span>Comé natural.</span>
            </h1>
            <p className="home-lead">
              Granolas artesanales, snacks saludables, productos sin TACC, infusiones, miel pura y mucho más.
              Elegidos con amor para acompañarte todos los días.
            </p>

            <div className="home-cta">
              <Link to="/shop" className="btn-leaf home-cta-main">
                Ir a la tienda <FaArrowRight />
              </Link>
              <button className="btn-ghost" onClick={() => setShowWhatsApp(true)}>
                <FaWhatsapp /> Consultanos
              </button>
            </div>

            <Link to="/shop" className="home-fake-search">
              <FaSearch /> Buscá granola, yerba, galletitas…
            </Link>
          </motion.div>

          <div className="home-hero-art">
            <div className="home-hero-blob" />
            <motion.img
              src={Barrita}
              alt="Barrita de cereal con frutos secos"
              className="home-hero-img"
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              width="520"
              height="520"
              fetchPriority="high"
            />
            <span className="home-sticker s1">🌾 Sin TACC</span>
            <span className="home-sticker s2">🍯 Miel pura</span>
            <span className="home-sticker s3">🥜 Frutos secos</span>
          </div>
        </div>
      </section>

      {/* ---------- Beneficios ---------- */}
      <section className="home-perks">
        <div className="home-perk">
          <span className="home-perk-icon"><FaTruck /></span>
          <div>
            <strong>Envíos a domicilio</strong>
            <p>Rosario, Alvarez, Piñero, Soldini y Pueblo Muñoz.</p>
          </div>
        </div>
        <div className="home-perk">
          <span className="home-perk-icon leaf"><FaLeaf /></span>
          <div>
            <strong>+100 productos</strong>
            <p>Infusiones, sin TACC y snacks saludables.</p>
          </div>
        </div>
        <div className="home-perk">
          <span className="home-perk-icon honey"><FaComments /></span>
          <div>
            <strong>Te asesoramos</strong>
            <p>Escribinos y te ayudamos a elegir.</p>
          </div>
        </div>
      </section>

      {/* ---------- Etiquetas ---------- */}
      <section className="home-section home-tags-section">
        <div className="home-section-head">
          <h2>¿Buscás algo especial?</h2>
        </div>
        <div className="home-tags">
          {PRODUCT_TAGS.map((t) => (
            <Link key={t.name} to={`/shop?etiqueta=${encodeURIComponent(t.name)}`} className="home-tag">
              <span className="home-tag-emoji">{t.emoji}</span>
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Categorías ---------- */}
      {categories.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <h2>Explorá por categoría</h2>
            <Link to="/shop" className="home-see-all">Ver todo <FaArrowRight /></Link>
          </div>
          <div className="home-cats">
            {categories.slice(0, 10).map((cat, i) => (
              <Link
                key={cat._id}
                to={`/shop?categoria=${encodeURIComponent(cat.nombre)}`}
                className="home-cat"
                style={{ "--i": i }}
              >
                <span className="home-cat-emoji">{CATEGORY_EMOJIS[i % CATEGORY_EMOJIS.length]}</span>
                <span>{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Productos nuevos ---------- */}
      <section className="home-section">
        <div className="home-section-head">
          <h2>Recién llegados</h2>
          <Link to="/shop" className="home-see-all">Ver todos <FaArrowRight /></Link>
        </div>
        <div className="modern-product-grid">
          {loadingFeatured && <ServerWaking />}
          {loadingFeatured
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : featuredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} onOpen={handleOpen} />
              ))}
        </div>
        <div className="home-more">
          <Link to="/shop" className="btn-brand">
            Ver todos los productos <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* ---------- Marcas ---------- */}
      <section className="home-section home-brands">
        <div className="home-section-head center">
          <h2>Nuestras marcas</h2>
          <p>Tocá una marca para ver todos sus productos</p>
        </div>
        <BrandsMarquee />
      </section>

      {/* ---------- Sobre nosotros ---------- */}
      <section className="home-about">
        <div className="home-about-photo">
          <img src={HomePhoto} alt="Granola con frutillas y frutos secos" loading="lazy" width="1000" height="796" />
        </div>
        <div className="home-about-text">
          <span className="home-eyebrow">Sobre nosotros</span>
          <h2>Cuidamos tu bienestar de forma natural</h2>
          <p>
            Seleccionamos cada producto con amor y compromiso para que vos y tu familia puedan disfrutar de una
            vida más sana y consciente. Desde <strong>granolas artesanales, barritas energéticas, té natural y
            yerbas orgánicas</strong> hasta <strong>miel pura</strong> y mucho más.
          </p>
          <div className="home-cta">
            <Link to="/contact" className="btn-ghost">Conocenos</Link>
            <a
              href="https://www.instagram.com/rubio.hnos"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand"
            >
              <FaInstagram /> Seguinos
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Pie ---------- */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div>
            <div className="home-footer-brand">Rubio Hnos</div>
            <p>Productos naturales y saludables, seleccionados para tu bienestar.</p>
          </div>
          <nav className="home-footer-links" aria-label="Pie de página">
            <Link to="/shop">Tienda</Link>
            <Link to="/myOrders">Mis pedidos</Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to="/contact">Contacto</Link>
          </nav>
          <div className="home-footer-social">
            <a href="https://www.instagram.com/rubio.hnos" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <button onClick={() => setShowWhatsApp(true)} aria-label="WhatsApp">
              <FaWhatsapp />
            </button>
          </div>
        </div>
        <p className="home-footer-copy">Rubio Hnos © {new Date().getFullYear()}</p>
      </footer>

      {/* Botón WhatsApp */}
      <button className="whatsapp-button" onClick={() => setShowWhatsApp(true)} aria-label="Escribinos por WhatsApp">
        <FaWhatsapp />
      </button>

      <Modal show={showWhatsApp} onHide={() => setShowWhatsApp(false)} centered contentClassName="wa-modal">
        <Modal.Body>
          <h3 className="wa-title">¿Con quién querés hablar?</h3>
          <p className="wa-sub">Te respondemos por WhatsApp 💬</p>
          {CONTACTS.map((c) => (
            <a
              key={c.phone}
              className="wa-contact"
              href={`https://wa.me/${c.phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="wa-avatar">{c.name[0]}</span>
              <span className="wa-name">{c.name}</span>
              <span className="wa-go"><FaWhatsapp /> Escribir</span>
            </a>
          ))}
          <button className="btn-ghost wa-close" onClick={() => setShowWhatsApp(false)}>Cerrar</button>
        </Modal.Body>
      </Modal>

      <ProductModal product={selected} onHide={() => setSelected(null)} />
      <CartBar />
    </div>
  );
}
