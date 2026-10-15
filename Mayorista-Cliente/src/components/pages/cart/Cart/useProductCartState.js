import { useCart } from "../../../../store.js";

// Cada tarjeta se suscribe SOLO a su cantidad en el carrito y a si es favorita.
// Así, al agregar un producto no se vuelven a dibujar todas las tarjetas.
export function useProductCartState(product) {
  const quantity = useCart(
    (state) => state.cart.find((item) => item._id === product._id)?.quantity || 0
  );
  const isFavorite = useCart((state) =>
    state.favorites.some((fav) => fav._id === product._id)
  );
  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
  const toggleFavorite = useCart((state) => state.toggleFavorite);

  const stockLeft = Number(product.stock) - quantity;

  return { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft };
}

export const formatPrice = (price) =>
  `$${Number(price).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
