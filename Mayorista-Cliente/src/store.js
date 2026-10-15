import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set) => ({
      count: 0,
      cart: [],
      favorites: [],

      // Funciones de favoritos
      toggleFavorite: (product) =>
        set((state) => {
          const isFavorited = state.favorites.some((fav) => fav._id === product._id);
          if (isFavorited) {
            return {
              favorites: state.favorites.filter((fav) => fav._id !== product._id),
            };
          } else {
            return {
              favorites: [...state.favorites, product],
            };
          }
        }),

      // Funciones para manejar el carrito stock
      addCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem._id === item._id
          );

          if (existingItem) {
            if (existingItem.quantity < existingItem.stock) {
              // Solo aumentamos si no supera el stock
              return {
                count: state.count + 1,
                cart: state.cart.map((cartItem) =>
                  cartItem._id === item._id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
                ),
              };
            } else {
              // Límite de stock: la interfaz ya deshabilita el botón "+"
              return state; // No cambia el estado
            }
          }

          // Si no existe, agregamos el producto con quantity 1
          return {
            count: state.count + 1,
            cart: [...state.cart, { ...item, quantity: 1 }],
          };
        }),

      // Agrega varias unidades de una vez (sin pasar el stock disponible).
      // Se usa en "Repetir pedido". Devuelve cuántas se agregaron.
      addCartQty: (item, qty) => {
        let added = 0;
        set((state) => {
          const stock = Number(item.stock) || 0;
          const existing = state.cart.find((c) => c._id === item._id);
          const current = existing ? existing.quantity : 0;
          added = Math.max(0, Math.min(qty, stock - current));
          if (added === 0) return state;
          return {
            count: state.count + added,
            cart: existing
              ? state.cart.map((c) =>
                  c._id === item._id ? { ...item, quantity: c.quantity + added } : c
                )
              : [...state.cart, { ...item, quantity: added }],
          };
        });
        return added;
      },

      removeCart: (id) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item._id === id);
          if (existingItem && existingItem.quantity > 1) {
            return {
              count: state.count - 1,
              cart: state.cart.map((cartItem) =>
                cartItem._id === id
                  ? { ...cartItem, quantity: cartItem.quantity - 1 }
                  : cartItem
              ),
            };
          }
          return {
            count: state.count - 1,
            cart: state.cart.filter((item) => item._id !== id),
          };
        }),

      removeAllFromCart: (id) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item._id === id);
          if (existingItem) {
            return {
              count: state.count - existingItem.quantity,
              cart: state.cart.filter((item) => item._id !== id),
            };
          }
          return state;
        }),

      clearCart: () => set({ count: 0, cart: [] }),
    }),
    { name: "cart-storage" }
  )
);
