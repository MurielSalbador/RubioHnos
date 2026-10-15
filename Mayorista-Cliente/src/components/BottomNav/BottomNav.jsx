import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaStore, FaHeart, FaShoppingBasket, FaReceipt } from "react-icons/fa";
import { useCart } from "../../store.js";
import { useBump } from "../../hooks/useBump.js";
import "./BottomNav.css";

// Páginas donde la barra estorba (formularios a pantalla completa)
const HIDDEN_ON = ["/login", "/register", "/forgot-password", "/reset-password", "/finish"];

export default function BottomNav() {
  const { pathname } = useLocation();
  const cartCount = useCart((s) => s.cart.reduce((t, i) => t + i.quantity, 0));
  const favCount = useCart((s) => s.favorites.length);
  const bump = useBump(cartCount);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const cls = ({ isActive }) => `bn-item ${isActive ? "active" : ""}`;

  return (
    <nav className="bottom-nav" aria-label="Navegación rápida">
      <NavLink to="/" end className={cls}>
        <FaHome />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/shop" className={cls}>
        <FaStore />
        <span>Tienda</span>
      </NavLink>
      <NavLink to="/favorites" className={cls}>
        <span className="bn-icon">
          <FaHeart />
          {favCount > 0 && <span className="bn-badge berry">{favCount}</span>}
        </span>
        <span>Favoritos</span>
      </NavLink>
      <NavLink to="/myOrders" className={cls}>
        <FaReceipt />
        <span>Pedidos</span>
      </NavLink>
      <NavLink to="/cart" className={cls}>
        <span className={`bn-icon ${bump ? "bump" : ""}`}>
          <FaShoppingBasket />
          {cartCount > 0 && <span className="bn-badge">{cartCount}</span>}
        </span>
        <span>Carrito</span>
      </NavLink>
    </nav>
  );
}
