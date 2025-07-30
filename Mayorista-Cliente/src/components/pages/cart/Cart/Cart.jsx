import { useShallow } from "zustand/shallow";
import { useCart } from "../../../../store.js";
import { useFilters } from "../../../../hooks/useFilters.js";
import { toast, ToastContainer } from "react-toastify";

//incremente el stock del producto al eliminarlo del carrito
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const { count, cart, addCart, removeCart } = useCart(
    useShallow((state) => ({
      count: state.count,
      cart: state.cart,
      addCart: state.addCart,
      removeCart: state.removeCart,
    }))
  );

  const { filters, filterProducts } = useFilters();
  const filteredCart = filterProducts(cart);

  const totalItems = filteredCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = filteredCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Para actualizar el stock de los productos al eliminar del carrito
  const queryClient = useQueryClient();

  return (

    <div className="cart">
      <h3 className="cart-title">Cart:</h3>
      <ul className="cart-list">
        {filteredCart.map((item) => (
          <li key={item._id + item.title} className="cart-item">
            <span className="item-name">
              {item.title.length > 20
                ? `${item.title.slice(0, 80)}`
                : item.title}
            </span>
            <div className="item-controls">
              <button
                onClick={() => {
                  removeCart(item._id);

                  
                }}
              >
                -
              </button>

              <span>{item.quantity}</span>
              <button
                onClick={() => {
                  if (item.quantity < item.stock) {
                    addCart(item);

                    queryClient.setQueryData(
                      ["products", filters],
                      (oldProducts) => {
                        return oldProducts.map((p) =>
                          p._id === item._id ? { ...p, stock: p.stock - 1 } : p
                        );
                      }
                    );
                  } else {
                    toast.info(
                      "¡Has alcanzado el stock máximo disponible para este producto!"
                    );
                  }
                }}
              >
                +
              </button>
            </div>
            <span className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div>
          <p>Items Total :</p>
          <p>{totalItems}</p>
        </div>
        <div>
          <p>Precio Total :</p>
          <p>${totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
