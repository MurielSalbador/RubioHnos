import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductById } from "../../../../api/fakeStoreApi.js";
import Header from "../../../header/Header.jsx";

import "./ProductDetail.css";

import { useCart } from "../../../../store.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

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
      <Header />

      <div className="product-detail-page">
        <div
          className="centered-product-container"
          data-aos="zoom-in"
          data-aos-duration="600"
        >
          <div className="centered-product-image-container">
            <img src={product.imageUrl} alt={product.title} className="centered-product-image"/>
          </div>
          
          <div className="centered-product-info-wrapper">
            <div className="centered-product-brand">{product.brand}</div>
            <h1 className="centered-product-title">{product.title}</h1>
            <div className="centered-product-price">${product.price}</div>
            
            <div className="centered-stock-info">
              <span className={`centered-stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `Stock Disponible: ${product.stock}` : "Sin Stock"}
              </span>
              {product.stock === 1 && (
                <span className="centered-stock-badge">¡Último disponible!</span>
              )}
            </div>

            <div className="centered-action-area">
              {quantityInCart === 0 ? (
                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className="centered-add-btn"
                >
                  {product.stock === 0 ? "Sin stock" : "Agregar al Carrito"}
                </button>
              ) : (
                <div className="centered-qty-selector">
                  <button onClick={handleRemoveFromCart} className="centered-qty-btn">-</button>
                  <span className="centered-qty-number">{quantityInCart}</span>
                  <button onClick={handleAddToCart} disabled={product.stock === 0} className="centered-qty-btn">+</button>
                </div>
              )}
              
              <Link className="centered-back-link" to="/shop">
                ← Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Notificaciones de toast */}
      <ToastContainer />
    </>
  );
}
