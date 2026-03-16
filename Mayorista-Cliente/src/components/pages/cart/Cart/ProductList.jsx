import { useFilters } from "../../../../hooks/useFilters.js";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import "./ProductList.css";

export default function ProductList({ search = "" }) {
  const { filters } = useFilters();
  const addCart = useCart((state) => state.addCart);
  const cart = useCart((state) => state.cart);
  const [favorites, setFavorites] = useState({});

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getAllProducts({ ...filters, limit: 1000 }),
  });

  if (isLoading) return <p className="loading-text">Buscando los mejores productos para vos...</p>;
  if (error) return <p className="error-text">Hubo un problema al cargar los productos.</p>;

  const products = data?.docs || [];

  const filteredProducts = products
    .filter((p) => p.available)
    .filter((p) => {
      const title = p.title?.toLowerCase() || "";
      const term = search.toLowerCase();
      return title.includes(term);
    });

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="modern-product-grid">
      {filteredProducts.length === 0 ? (
        <div className="no-products">
           <p>No encontramos nada con esos filtros. ¡Intentá con otra combinación!</p>
        </div>
      ) : (
        filteredProducts.map((product) => (
          <div key={product._id} className="modern-product-card">
            <div className="card-image-wrapper">
              {product.imageUrl && (
                <img loading="lazy" decoding="async" src={product.imageUrl} alt={product.title} />
              )}
              <button 
                className="fav-btn" 
                onClick={() => toggleFavorite(product._id)}
              >
                {favorites[product._id] ? <FaHeart color="#e91e63" /> : <FaRegHeart />}
              </button>
            </div>

            <div className="card-info">
              <h3 title={product.title}>{product.title}</h3>
              <p className="card-brand">{product.brand}</p>
              
              <div className="card-footer">
                <p className="card-price">${product.price}</p>
                <button
                  className="add-to-cart-btn"
                  disabled={getAdjustedStock(product, cart) === 0}
                  onClick={() => addCart(product)}
                >
                  {getAdjustedStock(product, cart) === 0 ? "Sin stock" : "Agregar"}
                </button>
              </div>
              
              {getAdjustedStock(product, cart) < 5 && getAdjustedStock(product, cart) > 0 && (
                 <span className="low-stock-label">Quedan pocos</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
