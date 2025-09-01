import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./MarcaPage.css";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function MarcaPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
  const cart = useCart((state) => state.cart);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/products/brand/${slug}`);
      if (!res.ok) throw new Error("No se pudieron obtener los productos");
      return res.json();
    },
  });

  const handleAddToCart = (product) => {
    if (getAdjustedStock(product, cart) === 0) return;

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      // Guardamos la URL actual para redirigir después del login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      setShowLoginModal(true);
      return;
    }

    addCart(product);
    toast.success("¡Producto agregado al carrito!");
  };

  const handleRemoveFromCart = (product) => {
    const productInCart = cart.find((item) => item._id === product._id);
    const quantityInCart = productInCart ? productInCart.quantity : 0;

    if (quantityInCart > 0) {
      removeCart(product._id);
      toast.info("Producto eliminado del carrito");
    } else {
      toast.info("No hay unidades de este producto en el carrito");
    }
  };

  if (isLoading) return <p>Cargando productos de {slug}...</p>;
  if (error) return <p>{error.message}</p>;
  if (products.length === 0)
    return <p>No hay productos disponibles para esta marca.</p>;

  return (
    <div className="products-container">
      <button className="back-button" onClick={() => window.history.back()}>
        ← Volver
      </button>

      <div className="product-title">
        <h2>Productos de la marca: {slug}</h2>
      </div>

      <ul className="product-list-marcaPage">
        {products.map((product) => {
          const productInCart = cart.find((item) => item._id === product._id);
          const quantityInCart = productInCart ? productInCart.quantity : 0;

          return (
            <li key={product._id} className="product-card-marcaPage">
              <img
                src={
                  product.imageUrl ||
                  product.image ||
                  "https://via.placeholder.com/250x150?text=Sin+imagen"
                }
                alt={product.title}
                className="product-image"
              />
              <h3 className="product-title">
                {product.title.length > 80
                  ? `${product.title.slice(0, 80)}...`
                  : product.title}
              </h3>
              <p className="product-brand">Marca: {product.brand}</p>
              <p className="product-price">Precio: ${product.price}</p>
              <p className="product-stock">
                Stock: {getAdjustedStock(product, cart)}
              </p>

              {getAdjustedStock(product, cart) === 1 && (
                <p className="stock-alert">¡Último disponible!</p>
              )}

              <div className="product-buttons">
                <button
                  disabled={getAdjustedStock(product, cart) === 0}
                  onClick={() => handleAddToCart(product)}
                >
                  {getAdjustedStock(product, cart) === 0
                    ? "Sin stock"
                    : "Agregar al carrito"}
                </button>

                <button
                  disabled={quantityInCart === 0}
                  onClick={() => handleRemoveFromCart(product)}
                >
                  Borrar del carrito
                </button>

                <span className="quantity-in-cart">
                  Agregados: {quantityInCart}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ✅ Modal de login */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Iniciar sesión requerido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Para agregar productos al carrito necesitás iniciar sesión.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowLoginModal(false);
              navigate("/login");
            }}
          >
            Ir al login
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
