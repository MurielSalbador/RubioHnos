import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaHeart } from "react-icons/fa";
import { useCart } from "../../../store.js";
import ProductCard from "../cart/Cart/ProductCard.jsx";
import ProductModal from "../cart/Cart/ProductModal.jsx";
import CartBar from "../cart/Cart/CartBar.jsx";
import "../shop/Shop.css";
import "./FavoritesPage.css";

export default function FavoritesPage() {
  const favorites = useCart((state) => state.favorites);
  const [selected, setSelected] = useState(null);
  const handleOpen = useCallback((p) => setSelected(p), []);

  return (
    <main className="page-shell favorites-main">
      <div className="favorites-container">
        <Link to="/shop" className="favorites-back">
          <FaArrowLeft /> Volver a la tienda
        </Link>
        <h1 className="favorites-title">
          Mis favoritos <FaHeart className="favorites-heart" />
        </h1>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">💛</div>
            <h2>Todavía no guardaste favoritos</h2>
            <p>Tocá el corazón de cualquier producto para tenerlo siempre a mano acá.</p>
            <Link to="/shop" className="btn-leaf">Descubrir productos</Link>
          </div>
        ) : (
          <>
            <p className="favorites-count">
              {favorites.length === 1 ? "1 producto guardado" : `${favorites.length} productos guardados`}
            </p>
            <div className="modern-product-grid">
              {favorites.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} onOpen={handleOpen} />
              ))}
            </div>
          </>
        )}
      </div>
      <ProductModal product={selected} onHide={() => setSelected(null)} />
      <CartBar />
    </main>
  );
}
