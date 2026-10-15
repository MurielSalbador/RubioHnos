import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaPlus, FaMinus, FaTimes, FaShoppingBasket } from "react-icons/fa";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../../utils/image.js";
import { useProductCartState, formatPrice } from "./useProductCartState.js";
import "./ProductCard.css";

function ProductModalBody({ product, footer, onHide }) {
  const { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft } =
    useProductCartState(product);
  const stock = Number(product.stock) || 0;
  const categories = Array.isArray(product.categoryIds)
    ? product.categoryIds.filter((c) => c && typeof c === "object" && c.nombre)
    : [];

  return (
    <div className="pm-wrap">
      <button className="pm-close" onClick={onHide} aria-label="Cerrar">
        <FaTimes />
      </button>

      <div className="pm-media">
        <img src={getImageUrl(product.imageUrl || product.image, 800)} alt={product.title} />
        <button
          className={`pc-fav ${isFavorite ? "on" : ""}`}
          onClick={() => toggleFavorite(product)}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="pm-info">
        {product.brand && <span className="pc-brand">{product.brand}</span>}
        <h3 className="pm-title">{product.title}</h3>

        {categories.length > 0 && (
          <div className="pm-cats">
            {categories.map((c) => (
              <span key={c._id}>{c.nombre}</span>
            ))}
          </div>
        )}

        <div className="pm-price-row">
          <span className="pm-price">{formatPrice(product.price)}</span>
          <span className={`pm-stock ${stock <= 0 ? "out" : stock < 5 ? "few" : ""}`}>
            {stock <= 0 ? "Sin stock" : stock < 5 ? `Quedan ${stock}` : "Disponible"}
          </span>
        </div>

        {product.description && <p className="pm-desc">{product.description}</p>}

        <div className="pm-actions">
          {quantity === 0 ? (
            <button
              className="btn-leaf pm-add"
              disabled={stockLeft <= 0}
              onClick={() => {
                addCart(product);
                toast.success("¡Agregado al carrito!", { autoClose: 1500, icon: "🧺" });
              }}
            >
              <FaShoppingBasket /> {stockLeft <= 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          ) : (
            <div className="pm-qty-row">
              <div className="pc-qty pm-qty">
                <button onClick={() => removeCart(product._id)} aria-label="Quitar uno">
                  <FaMinus />
                </button>
                <span>{quantity}</span>
                <button disabled={stockLeft <= 0} onClick={() => addCart(product)} aria-label="Agregar uno">
                  <FaPlus />
                </button>
              </div>
              <Link to="/cart" className="btn-brand pm-go-cart" onClick={onHide}>
                Ver carrito
              </Link>
            </div>
          )}
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function ProductModal({ product, onHide, footer }) {
  return (
    <Modal
      show={!!product}
      onHide={onHide}
      centered
      dialogClassName="pm-dialog"
      contentClassName="pm-content"
    >
      {product && <ProductModalBody product={product} footer={footer} onHide={onHide} />}
    </Modal>
  );
}
