import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaArrowLeft, FaHeart, FaRegHeart, FaPlus, FaMinus, FaShoppingBasket, FaLeaf, FaTruck, FaWhatsapp } from "react-icons/fa";
import { getProductById } from "../../../../api/fakeStoreApi.js";
import Header from "../../../header/Header.jsx";
import { getImageUrl } from "../../../../utils/image.js";
import { useProductCartState, formatPrice } from "../../cart/Cart/useProductCartState.js";
import { tagInfo } from "../../../../utils/productTags.js";
import "../../cart/Cart/ProductCard.css";
import "./ProductDetail.css";

function DetailBody({ product }) {
  // Antes se restaba el stock "a mano" en la página y quedaba mal
  // (decía 1 cuando había 3). Ahora se calcula con lo que hay en el carrito.
  const { quantity, isFavorite, addCart, removeCart, toggleFavorite, stockLeft } =
    useProductCartState(product);
  const stock = Number(product.stock) || 0;
  const categories = Array.isArray(product.categoryIds)
    ? product.categoryIds.filter((c) => c && typeof c === "object" && c.nombre)
    : [];

  return (
    <div className="pd-card">
      <div className="pd-media">
        <img src={getImageUrl(product.imageUrl, 900)} alt={product.title} />
        <button
          className={`pc-fav ${isFavorite ? "on" : ""}`}
          onClick={() => toggleFavorite(product)}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="pd-info">
        {product.brand && (
          <Link to={`/marca/${encodeURIComponent(product.brand)}`} className="pc-brand pd-brand">
            {product.brand}
          </Link>
        )}
        <h1 className="pd-title">{product.title}</h1>

        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="pm-tags">
            {product.tags.map((t) => (
              <Link key={t} to={`/shop?etiqueta=${encodeURIComponent(t)}`}>{tagInfo(t).emoji} {t}</Link>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="pm-cats">
            {categories.map((c) => <span key={c._id}>{c.nombre}</span>)}
          </div>
        )}

        <div className="pd-price-row">
          <span className="pd-price">{formatPrice(product.price)}</span>
          <span className={`pm-stock ${stock <= 0 ? "out" : stock < 5 ? "few" : ""}`}>
            {stock <= 0 ? "Sin stock" : stock === 1 ? "¡Última unidad!" : stock < 5 ? `Quedan ${stock}` : "Disponible"}
          </span>
        </div>

        {product.description && <p className="pm-desc">{product.description}</p>}

        <div className="pd-actions">
          {quantity === 0 ? (
            <button
              className="btn-leaf pd-add"
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
                <button onClick={() => removeCart(product._id)} aria-label="Quitar uno"><FaMinus /></button>
                <span>{quantity}</span>
                <button disabled={stockLeft <= 0} onClick={() => addCart(product)} aria-label="Agregar uno"><FaPlus /></button>
              </div>
              <Link to="/cart" className="btn-brand pm-go-cart">Ver carrito</Link>
            </div>
          )}
        </div>

        <ul className="pd-perks">
          <li><FaLeaf /> Producto natural seleccionado</li>
          <li><FaTruck /> Envíos a Rosario, Alvarez, Piñero, Soldini y Pueblo Muñoz</li>
          <li><FaWhatsapp /> Coordinás el pago por WhatsApp</li>
        </ul>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  return (
    <>
      <Header />
      <main className="product-detail-page">
        <Link className="pd-back" to="/shop">
          <FaArrowLeft /> Volver a la tienda
        </Link>

        {isLoading ? (
          <div className="pd-card pd-skeleton">
            <div className="pd-media shimmer" />
            <div className="pd-info">
              <div className="shimmer" style={{ height: 24, width: "40%", borderRadius: 8 }} />
              <div className="shimmer" style={{ height: 40, width: "85%", borderRadius: 8, marginTop: 12 }} />
              <div className="shimmer" style={{ height: 32, width: "30%", borderRadius: 8, marginTop: 20 }} />
            </div>
          </div>
        ) : error || !product ? (
          <div className="pd-error">
            <div style={{ fontSize: "3rem" }}>🤔</div>
            <h2>No encontramos este producto</h2>
            <p>Puede que ya no esté disponible.</p>
            <Link to="/shop" className="btn-leaf">Ver otros productos</Link>
          </div>
        ) : (
          <DetailBody product={product} />
        )}
      </main>
    </>
  );
}
