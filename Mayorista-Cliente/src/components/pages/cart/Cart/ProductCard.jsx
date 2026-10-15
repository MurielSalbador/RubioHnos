import { memo, useState } from "react";
import { FaHeart, FaRegHeart, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../../utils/image.js";
import { useProductCartState, formatPrice } from "./useProductCartState.js";
import { tagInfo } from "../../../../utils/productTags.js";
import "./ProductCard.css";

function ProductCard({ product, onOpen, index = 0 }) {
  const { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft } =
    useProductCartState(product);
  const [justAdded, setJustAdded] = useState(false);

  const imageUrl = getImageUrl(product.imageUrl || product.image, 400);
  const outOfStock = Number(product.stock) <= 0;

  const handleAdd = () => {
    addCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
    if (quantity === 0) {
      toast.success(`¡${product.title} al carrito!`, { autoClose: 1500, icon: "🧺" });
    }
  };

  return (
    <article
      className={`pc-card card-appear ${outOfStock ? "is-out" : ""}`}
      style={{ animationDelay: `${Math.min(index % 12, 8) * 30}ms` }}
    >
      <div className="pc-media" onClick={() => onOpen?.(product)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen?.(product)} aria-label={`Ver ${product.title}`}>
        {imageUrl ? (
          <img loading="lazy" decoding="async" src={imageUrl} alt={product.title} width="400" height="400" />
        ) : (
          <div className="pc-placeholder">Sin foto</div>
        )}

        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="pc-tags">
            {product.tags.slice(0, 2).map((t) => (
              <span key={t} title={t}>{tagInfo(t).short}</span>
            ))}
          </div>
        )}

        {outOfStock ? (
          <span className="pc-tag out">Sin stock</span>
        ) : stockLeft > 0 && stockLeft < 5 ? (
          <span className="pc-tag few">{stockLeft === 1 ? "¡Última unidad!" : `¡Últimas ${stockLeft}!`}</span>
        ) : null}
      </div>

      <button
        className={`pc-fav ${isFavorite ? "on" : ""}`}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        onClick={() => toggleFavorite(product)}
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div className="pc-body">
        {product.brand && <span className="pc-brand">{product.brand}</span>}
        <h3 className="pc-title" title={product.title} onClick={() => onOpen?.(product)}>
          {product.title}
        </h3>

        <div className="pc-footer">
          <span className="pc-price">{formatPrice(product.price)}</span>

          {quantity === 0 ? (
            <button
              className={`pc-add ${justAdded ? "added" : ""}`}
              disabled={stockLeft <= 0}
              onClick={handleAdd}
              aria-label={`Agregar ${product.title} al carrito`}
            >
              {justAdded ? <FaCheck /> : <FaPlus />}
              <span className="pc-add-label">{stockLeft <= 0 ? "Agotado" : "Agregar"}</span>
            </button>
          ) : (
            <div className="pc-qty">
              <button aria-label="Quitar uno" onClick={() => removeCart(product._id)}>
                <FaMinus size={10} />
              </button>
              <span className={justAdded ? "pop" : ""}>{quantity}</span>
              <button aria-label="Agregar uno" disabled={stockLeft <= 0} onClick={handleAdd}>
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
