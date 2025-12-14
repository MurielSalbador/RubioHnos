import { useState } from "react";
import AccountButton from "../pages/income/account/AccountButton.jsx";
import { isSuperAdmin, isAdminOrSuperAdmin } from "../../utils/auth.js";
import "./header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-actions">
        {/* Logo */}
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

        {/* Menú combinado */}
        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
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
                <i className="fa-solid fa-box"></i> Pedidos
              </a>
            </li>
            {isSuperAdmin() && (
              <li>
                <a href="/httpClients" className="link">
                  <i className="fa-solid fa-users"></i> Clientes
                </a>
              </li>
            )}
            {isAdminOrSuperAdmin() && (
  <li>
    <a href="/expenses" className="link">
      <i className="fa-solid fa-money-check-dollar"></i> Gastos
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
        </nav>

        {/* Botón hamburguesa */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}