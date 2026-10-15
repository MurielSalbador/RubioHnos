import { Modal } from "react-bootstrap";
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../../utils/image.js";
import { useProductCartState, formatPrice } from "./useProductCartState.js";

function ProductModalBody({ product, footer }) {
  const { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft } =
    useProductCartState(product);

  return (
    <>
      <Modal.Header closeButton className="modal-borderless"></Modal.Header>
      <Modal.Body className="p-0">
        <div className="modal-product-image">
          <img src={getImageUrl(product.imageUrl || product.image, 800)} alt={product.title} />
          <button className="modal-fav-btn" onClick={() => toggleFavorite(product)}>
            {isFavorite ? <FaHeart color="#e91e63" size={24} /> : <FaRegHeart size={24} />}
          </button>
        </div>
        <div className="modal-product-details">
          <p className="modal-brand">{product.brand}</p>
          <h3>{product.title}</h3>
          <p className="modal-price">{formatPrice(product.price)}</p>

          {product.description && <p className="modal-desc">{product.description}</p>}

          <div className="modal-actions">
            {quantity === 0 ? (
              <button
                className="modal-add-btn"
                disabled={stockLeft <= 0}
                onClick={() => {
                  addCart(product);
                  toast.success(`¡Agregado al carrito!`, {
                    position: "bottom-center",
                    autoClose: 1500,
                    theme: "colored",
                  });
                }}
              >
                {stockLeft <= 0 ? "Sin stock" : "Agregar al Carrito"}
              </button>
            ) : (
              <div className="modal-qty-selector">
                <button className="mqty-btn" onClick={() => removeCart(product._id)}>
                  <FaMinus />
                </button>
                <span className="mqty-number">{quantity}</span>
                <button className="mqty-btn" disabled={stockLeft <= 0} onClick={() => addCart(product)}>
                  <FaPlus />
                </button>
              </div>
            )}
            {footer}
          </div>
        </div>
      </Modal.Body>
    </>
  );
}

export default function ProductModal({ product, onHide, footer }) {
  return (
    <Modal show={!!product} onHide={onHide} centered contentClassName="premium-product-modal">
      {product && <ProductModalBody product={product} footer={footer} />}
    </Modal>
  );
}
