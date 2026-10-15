import { Link } from "react-router-dom";
import { FaShoppingBasket, FaArrowRight } from "react-icons/fa";
import { useCart } from "../../../../store.js";
import { useBump } from "../../../../hooks/useBump.js";
import { formatPrice } from "./useProductCartState.js";

// Barra flotante con el total del carrito: siempre a mano mientras se compra
export default function CartBar() {
  const count = useCart((s) => s.cart.reduce((t, i) => t + i.quantity, 0));
  const total = useCart((s) => s.cart.reduce((t, i) => t + i.price * i.quantity, 0));
  const bump = useBump(count);

  if (count === 0) return null;

  return (
    <Link to="/cart" className={`cart-bar ${bump ? "bump" : ""}`} aria-label="Ver carrito">
      <span className="cart-bar-icon">
        <FaShoppingBasket />
        <span className="cart-bar-count">{count}</span>
      </span>
      <span className="cart-bar-text">
        <small>{count === 1 ? "1 producto" : `${count} productos`}</small>
        <strong>{formatPrice(total)}</strong>
      </span>
      <span className="cart-bar-cta">
        Ver carrito <FaArrowRight />
      </span>
    </Link>
  );
}
