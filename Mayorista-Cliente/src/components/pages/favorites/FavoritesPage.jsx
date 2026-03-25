import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../store.js";
import { getAdjustedStock } from "../../../utils/calculateStock.js";
import CloseButton from "react-bootstrap/CloseButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FavoritesPage.css";
import { FaHeart, FaTrash } from "react-icons/fa";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = useCart((state) => state.favorites);
  const toggleFavorite = useCart((state) => state.toggleFavorite);
  const addCart = useCart((state) => state.addCart);
  const cart = useCart((state) => state.cart);

  return (
    <main className="favorites-main">
      <div className="favorites-container">
        <div className="favorites-header">
          <h1 className="favorites-title">
            <FaHeart style={{ color: "#e91e63", marginRight: "10px" }} />
            Mis Favoritos
          </h1>
          <CloseButton onClick={() => navigate("/shop")} />
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <p>Todavía no agregaste ningún producto a favoritos.</p>
            <Link to="/shop" className="favorites-shop-btn">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <div className="favorites-list">
              {favorites.map((product) => {
                const stockAvailable = getAdjustedStock(product, cart);

                return (
                  <div key={product._id} className="favorite-item">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="favorite-item-img"
                    />
                    <div className="favorite-item-info">
                      <h3>{product.title}</h3>
                      <p className="favorite-item-brand">{product.brand}</p>
                      <p className="favorite-item-price">${product.price}</p>
                    </div>

                    <div className="favorite-item-actions">
                      <button
                        className="favorite-add-btn"
                        disabled={stockAvailable === 0}
                        onClick={() => {
                          addCart(product);
                          toast.success(`¡${product.title} agregado!`, {
                            position: "bottom-center",
                            autoClose: 1500,
                            theme: "colored",
                          });
                        }}
                      >
                        {stockAvailable === 0 ? "Sin stock" : "Agregar al Carrito"}
                      </button>

                      <button
                        className="favorite-remove-btn"
                        onClick={() => toggleFavorite(product)}
                        title="Eliminar de favoritos"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="favorites-footer">
              <Link to="/shop" className="favorites-link-btn">
                Volver a la tienda
              </Link>
              <Link to="/cart" className="favorites-primary-btn">
                Ver mi carrito
              </Link>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </main>
  );
}
