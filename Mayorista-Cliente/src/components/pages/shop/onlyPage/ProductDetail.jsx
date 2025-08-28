import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductById } from "../../../../api/fakeStoreApi.js";
import Header from "../../../header/Header.jsx";

import "./ProductDetail.css";

import { useCart } from "../../../../store.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// importar componentes del carrito
import Filters from "../../cart/Cart/Filters.jsx";
import Cart from "../../cart/Cart/Cart.jsx";

import { useState, useEffect } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    if (showCartModal) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
  }, [showCartModal]);

  // store
  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
  const cart = useCart((state) => state.cart);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const productInCart = cart.find((item) => item._id === product?._id);
  const quantityInCart = productInCart ? productInCart.quantity : 0;

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addCart(product);
      toast.success("¡Producto agregado al carrito!");
      queryClient.setQueryData(["product", id], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, stock: oldData.stock - 1 };
      });
    }
  };

  const handleRemoveFromCart = () => {
    if (quantityInCart > 0) {
      removeCart(product._id);
      toast.info("Producto eliminado del carrito");
      queryClient.setQueryData(["product", id], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, stock: oldData.stock + 1 };
      });
    } else {
      toast.info("No hay unidades de este producto en el carrito");
    }
  };

  if (isLoading) return <p>Cargando producto...</p>;
  if (error) return <p>Error al cargar el producto</p>;

  return (
    <>
      <header className="main-header">
        <Header />
      </header>

      <div
        className="product-detail"
        data-aos="zoom-in"
        data-aos-duration="600"
        data-aos-delay="200"
      >
        <img src={product.imageUrl} alt={product.title} />
        <div className="info">
          <h2>{product.title}</h2>
          <p>
            <i className="fas fa-tag"></i> <strong>Marca:</strong>{" "}
            {product.brand}
          </p>
          <p>
            <i className="fas fa-dollar-sign"></i> <strong>Precio:</strong> $
            {product.price}
          </p>
          <p>
            <i className="fas fa-box"></i> <strong>Stock:</strong>{" "}
            {product.stock}
          </p>

          {product.stock === 1 && (
            <p className="stock-alert">¡Último disponible!</p>
          )}

          <div className="cart-controls">
            <button
              disabled={quantityInCart === 0}
              onClick={handleRemoveFromCart}
              className="remove-cart-btn"
            >
              Borrar del carrito
            </button>

            <span className="quantity-in-cart">
              Productos Agregados {quantityInCart}
            </span>

            <button
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="add-cart-btn"
            >
              {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>

          <a className="back-to-shop" href="/shop">
            Volver a la tienda
          </a>
        </div>
      </div>

      {/* Botón flotante 🛒 */}
      <button
        className="floating-cart-btn"
        onClick={() => setShowCartModal(true)}
      >
        🛒
      </button>

      {/* Modal carrito */}
      {showCartModal && (
        <div className="cart-modal">
          <div className="cart-modal-content">
            <button
              className="close-cart-btn"
              onClick={() => setShowCartModal(false)}
            >
              ✖
            </button>
            <Filters />
            <Cart />
            <div className="classButton">
              <Link to="/finish" onClick={() => setShowCartModal(false)}>
                Finalizar tu compra
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones de toast */}
      <ToastContainer />
    </>
  );
}
