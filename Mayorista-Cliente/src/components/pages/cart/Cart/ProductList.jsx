import { useFilters } from "../../../../hooks/useFilters.js";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SkeletonCard from "./SkeletonCard.jsx";
import "./ProductList.css";
import "./SkeletonCard.css";

export default function ProductList({ search = "" }) {
  const { filters } = useFilters();
  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
  const cart = useCart((state) => state.cart);
  const [favorites, setFavorites] = useState({});
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  // Cada vez que cambien los filtros o la búsqueda, reseteamos la lista y la página
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [filters, search]);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["products", filters, search, page],
    queryFn: () => getAllProducts({ ...filters, search, page, limit: 12 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data?.docs) {
      if (page === 1) {
        setAllProducts(data.docs);
      } else {
        setAllProducts(prev => {
          // Evitar duplicados por seguridad
          const existingIds = new Set(prev.map(p => p._id));
          const uniques = data.docs.filter(p => !existingIds.has(p._id));
          return [...prev, ...uniques];
        });
      }
    }
  }, [data, page]);

  if (isLoading && page === 1) {
    return (
      <div className="skeleton-product-grid">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) return <div className="error-container"><p className="error-text">Hubo un problema al cargar los productos.</p></div>;

  const hasMore = data ? page < data.totalPages : false;

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="product-list-container">
      <div className="modern-product-grid">
        {allProducts.length === 0 && !isFetching ? (
          <div className="no-products">
             <p>No encontramos nada con esos filtros. ¡Intentá con otra combinación!</p>
          </div>
        ) : (
          allProducts.map((product) => {
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

      {hasMore && (
        <div className="load-more-wrapper">
           <button 
            className="load-more-btn" 
            disabled={isFetching}
            onClick={() => setPage(prev => prev + 1)}
           >
             {isFetching ? "Cargando..." : "Cargar más productos"}
           </button>
        </div>
      )}
    </div>
  );
}
