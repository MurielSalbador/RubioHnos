import { memo } from "react";
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useProductCartState, formatPrice } from "./useProductCartState.js";
import { getImageUrl } from "../../../../utils/image.js";

function ProductCard({ product, onOpen, index = 0 }) {
  const { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft } =
    useProductCartState(product);

  const imageUrl = getImageUrl(product.imageUrl || product.image, 400);

  return (
    <div
      className="modern-product-card card-appear"
      style={{ animationDelay: `${Math.min(index % 12, 8) * 30}ms` }}
    >
      <div className="card-image-wrapper">
        {imageUrl ? (
          <img
            loading="lazy"
            decoding="async"
            src={imageUrl}
            alt={product.title}
            width="400"
            height="275"
            onClick={() => onOpen?.(product)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div className="card-image-placeholder" onClick={() => onOpen?.(product)}>
            Sin imagen
          </div>
        )}
        <button
          className="fav-btn"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={() => toggleFavorite(product)}
        >
          {isFavorite ? <FaHeart color="#e91e63" /> : <FaRegHeart />}
        </button>
      </div>

      <div className="card-info">
        <h3 title={product.title}>{product.title}</h3>
        <p className="card-brand">{product.brand}</p>

        <div className="card-footer">
          <p className="card-price">{formatPrice(product.price)}</p>

          {quantity === 0 ? (
            <button
              className="add-to-cart-btn"
              disabled={stockLeft <= 0}
              onClick={() => {
                addCart(product);
                toast.success(`¡${product.title} agregado!`, {
                  position: "bottom-right",
                  autoClose: 2000,
                  theme: "colored",
                });
              }}
            >
              {stockLeft <= 0 ? "Sin stock" : "Agregar"}
            </button>
          ) : (
            <div className="quantity-selector-modern">
              <button className="qty-btn" aria-label="Quitar uno" onClick={() => removeCart(product._id)}>
                <FaMinus size={10} />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                className="qty-btn"
                aria-label="Agregar uno"
                disabled={stockLeft <= 0}
                onClick={() => addCart(product)}
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>

        {stockLeft < 5 && stockLeft > 0 && (
          <span className="low-stock-label">Quedan pocos</span>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
