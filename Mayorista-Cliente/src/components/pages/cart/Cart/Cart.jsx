import { useShallow } from "zustand/shallow";
import { useCart } from "../../../../store.js";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import "./Cart.css";

export default function Cart() {
  const { cart, addCart, removeCart } = useCart(
    useShallow((state) => ({
      cart: state.cart,
      addCart: state.addCart,
      removeCart: state.removeCart,
    }))
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const queryClient = useQueryClient();

  if (cart.length === 0) {
    return (
      <div className="empty-cart-msg">
        <p>Tu carrito está vacío. ¡Empezá a buscar algo rico!</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <ul className="cart-list-premium">
        {cart.map((item) => (
          <li key={item._id} className="cart-item-modern">
            <div className="cart-item-image">
              <img src={item.imageUrl} alt={item.title} />
            </div>

            <div className="cart-item-info">
              <span className="cart-item-name" title={item.title}>
                {item.title}
              </span>
              <span className="cart-item-price-unit">
                ${item.price.toFixed(2)} x unidad
              </span>
            </div>

            <div className="cart-actions-right">
              <div className="cart-qty-controls">
                <button
                  className="cart-qty-btn"
                  onClick={() => removeCart(item._id)}
                >
                  {item.quantity === 1 ? <FaTrash size={10} /> : <FaMinus size={10} />}
                </button>

                <span className="cart-qty-num">{item.quantity}</span>

                <button
                  className="cart-qty-btn"
                  onClick={() => {
                    if (item.quantity < item.stock) {
                      addCart(item);
                    } else {
                      toast.info("¡Llegaste al límite de stock!");
                    }
                  }}
                >
                  <FaPlus size={10} />
                </button>
              </div>
              <span className="cart-item-total-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-summary-premium">
        <div className="summary-row">
          <span className="summary-label">Total de productos:</span>
          <span className="summary-value">{totalItems}</span>
        </div>
        <div className="summary-row total-row">
          <span className="total-label">Total a pagar:</span>
          <span className="total-value-premium">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
