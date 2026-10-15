import { Link } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { toast } from "react-toastify";
import { FaPlus, FaMinus, FaTrashAlt, FaArrowRight, FaTruck } from "react-icons/fa";
import { useCart } from "../../../../store.js";
import { getImageUrl } from "../../../../utils/image.js";
import { formatPrice } from "./useProductCartState.js";
import "./Cart.css";

export default function Cart() {
  const { cart, addCart, removeCart, removeAllFromCart } = useCart(
    useShallow((state) => ({
      cart: state.cart,
      addCart: state.addCart,
      removeCart: state.removeCart,
      removeAllFromCart: state.removeAllFromCart,
    }))
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🧺</div>
        <h2>Tu carrito está vacío</h2>
        <p>¡Empezá a buscar algo rico! Tenemos granolas, snacks, infusiones y mucho más.</p>
        <Link to="/shop" className="btn-leaf">
          Ir a la tienda <FaArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <ul className="cart-items">
        {cart.map((item) => (
          <li key={item._id} className="cart-row">
            <img
              className="cart-row-img"
              src={getImageUrl(item.imageUrl, 200)}
              alt={item.title}
              loading="lazy"
            />

            <div className="cart-row-info">
              {item.brand && <span className="cart-row-brand">{item.brand}</span>}
              <span className="cart-row-title" title={item.title}>{item.title}</span>
              <span className="cart-row-unit">{formatPrice(item.price)} c/u</span>
            </div>

            <div className="cart-row-actions">
              <span className="cart-row-total">{formatPrice(item.price * item.quantity)}</span>
              <div className="cart-row-controls">
                <div className="pc-qty">
                  <button aria-label="Quitar uno" onClick={() => removeCart(item._id)}>
                    <FaMinus size={10} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label="Agregar uno"
                    onClick={() => {
                      if (item.quantity < item.stock) addCart(item);
                      else toast.info("¡Llegaste al límite de stock!");
                    }}
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
                <button
                  className="cart-row-remove"
                  aria-label={`Eliminar ${item.title}`}
                  onClick={() => removeAllFromCart(item._id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="cart-summary">
        <h2>Resumen</h2>
        <div className="cart-summary-row">
          <span>Productos ({totalItems})</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="cart-summary-row muted">
          <span><FaTruck /> Envío</span>
          <span>Se calcula al elegir la localidad</span>
        </div>
        <div className="cart-summary-total">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <Link to="/finish" className="btn-leaf cart-summary-cta">
          Finalizar compra <FaArrowRight />
        </Link>
        <Link to="/shop" className="cart-summary-link">
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
