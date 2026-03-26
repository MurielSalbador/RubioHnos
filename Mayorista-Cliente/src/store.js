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
              // Podés mostrar un alert acá o manejarlo fuera de la store
              alert(
                "¡Has alcanzado el stock máximo disponible para este producto!"
              );
              return state; // No cambia el estado
            }
          }

          // Si no existe, agregamos el producto con quantity 1
          return {
            count: state.count + 1,
            cart: [...state.cart, { ...item, quantity: 1 }],
          };
        }),

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
