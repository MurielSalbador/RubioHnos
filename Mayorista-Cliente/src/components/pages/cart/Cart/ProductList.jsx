import { useFilters } from "../../../../hooks/useFilters.js";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import "./ProductList.css";

export default function ProductList({ search = "" }) {
  const { filters } = useFilters();
  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
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
        filteredProducts.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
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
                  
                  {quantity === 0 ? (
                    <button
                      className="add-to-cart-btn"
                      disabled={getAdjustedStock(product, cart) === 0}
                      onClick={() => {
                        addCart(product);
                        toast.success(`¡${product.title} agregado!`, {
                          position: "bottom-right",
                          autoClose: 2000,
                          theme: "colored"
                        });
                      }}
                    >
                      {getAdjustedStock(product, cart) === 0 ? "Sin stock" : "Agregar"}
                    </button>
                  ) : (
                    <div className="quantity-selector-modern">
                      <button 
                        className="qty-btn" 
                        onClick={() => removeCart(product._id)}
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="qty-number">{quantity}</span>
                      <button 
                        className="qty-btn" 
                        disabled={getAdjustedStock(product, cart) === 0}
                        onClick={() => addCart(product)}
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  )}
                </div>
                
                {getAdjustedStock(product, cart) < 5 && getAdjustedStock(product, cart) > 0 && (
                   <span className="low-stock-label">Quedan pocos</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
