import { useState } from "react";
import AccountButton from "../pages/income/account/AccountButton.jsx";
import { isSuperAdmin, isAdminOrSuperAdmin } from "../../utils/auth.js";
import "./header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-actions">
        {/* Logo a la izquierda */}
        <div className="nav-logo">
          <a href="/" className="logo-text">
            <div className="logo-line-1">RubioHnos</div>
            <div className="logo-line-2">-Tienda Natural-</div>
          </a>
        </div>

        {/* Links centrados */}
        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li><a href="/" className="link">Home</a></li>
            <li><a href="/contact" className="link">Contactanos</a></li>
            <li><a href="/shop" className="link">Tienda</a></li>
            <li><a href="/myOrders" className="link">Pedidos</a></li>
            {isSuperAdmin() && (
              <li><a href="/httpClients" className="link">Clientes</a></li>
            )}
            {isAdminOrSuperAdmin() && (
              <li><a href="/expenses" className="link">Gastos</a></li>
            )}
            {/* Solo se ve en móvil dentro del menú */}
            <li className="mobile-only">
              <div className="link">
                <AccountButton />
              </div>
            </li>
          </ul>
        </nav>

        {/* Acciones a la derecha */}
        <div className="header-right-actions">
          <div className="desktop-only">
            <AccountButton />
          </div>
          
          <a href="/cart" className="cart-btn">
            <i className="fa-solid fa-cart-shopping"></i>
          </a>

          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
}