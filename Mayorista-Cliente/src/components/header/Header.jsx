import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaShoppingBasket, FaHeart } from "react-icons/fa";
import AccountButton from "../pages/income/account/AccountButton.jsx";
import { isSuperAdmin, isAdminOrSuperAdmin } from "../../utils/auth.js";
import { useCart } from "../../store.js";
import { useBump } from "../../hooks/useBump.js";
import "./header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = useCart((state) => state.cart.reduce((total, item) => total + item.quantity, 0));
  const favoritesCount = useCart((state) => state.favorites.length);
  const cartBump = useBump(cartCount);

  // Cerrar el menú al navegar
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navClass = ({ isActive }) => `link ${isActive ? "active" : ""}`;

  return (
    <header className="main-header">
      <div className="header-actions">
        <Link to="/" className="logo-text" aria-label="Rubio Hnos - Inicio">
          <img src="/icon-192.png" alt="" className="logo-img" width="40" height="40" />
          <span>
            <span className="logo-line-1">Rubio Hnos</span>
            <span className="logo-line-2">Tienda natural</span>
          </span>
        </Link>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`} aria-label="Principal">
          <ul className="nav-links">
            <li><NavLink to="/" end className={navClass}>Inicio</NavLink></li>
            <li><NavLink to="/shop" className={navClass}>Tienda</NavLink></li>
            <li><NavLink to="/myOrders" className={navClass}>Mis pedidos</NavLink></li>
            <li><NavLink to="/contact" className={navClass}>Contacto</NavLink></li>
            {isAdminOrSuperAdmin() && (
              <>
                <li><NavLink to="/addProducts" className={navClass}>Productos</NavLink></li>
                <li><NavLink to="/allOrders" className={navClass}>Pedidos</NavLink></li>
                <li><NavLink to="/expenses" className={navClass}>Gastos</NavLink></li>
              </>
            )}
            {isSuperAdmin() && (
              <li><NavLink to="/httpClients" className={navClass}>Clientes</NavLink></li>
            )}
            <li className="mobile-only">
              <div className="link">
                <AccountButton />
              </div>
            </li>
          </ul>
        </nav>
        {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}

        <div className="header-right-actions">
          <div className="desktop-only">
            <AccountButton />
          </div>

          <Link to="/favorites" className="icon-btn desktop-only" aria-label={`Favoritos (${favoritesCount})`}>
            <FaHeart />
            {favoritesCount > 0 && <span className="icon-badge berry">{favoritesCount}</span>}
          </Link>

          <Link to="/cart" className={`icon-btn cart-btn ${cartBump ? "bump" : ""}`} aria-label={`Carrito (${cartCount})`}>
            <FaShoppingBasket />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>

          <button
            type="button"
            className={`hamburger ${menuOpen ? "active" : ""}`}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
