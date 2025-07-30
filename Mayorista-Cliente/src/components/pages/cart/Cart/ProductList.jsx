//productList.jsx
import useProductNavigation from "../../../../hooks/useProductNavigation/useProductNavigation.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import { useCart } from "../../../../store.js";
import { useFilters } from "../../../../hooks/useFilters.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";
import "./ProductList.css";


const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function ProductList() {
  // 👇 todos los hooks al principio
  const { filters } = useFilters();
  const { goToProductDetail } = useProductNavigation();
  const addCart = useCart((state) => state.addCart);
  const cart = useCart((state) => state.cart); // <-- esta línea es la que faltaba
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getAllProducts(filters),
  });

  // 👇 lógica después
  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos</p>;

  return (
    <div className="product-grid">
      {products.map((product) => (
       <div key={product._id} className="product-card">
          {/* 🔹 Imagen del producto */}
          {product.imageUrl && (
  <img src={`${API_URL}${product.imageUrl}`} alt={product.title} />
)}
          <h3 className="product-title">
            {product.title.length > 20
              ? `${product.title.slice(0, 80)}...`
              : product.title}
          </h3>

          <div className="product-footer">
            <p className="product-price">${product.price}</p>

            <p className="product-stock">
              Stock: {getAdjustedStock(product, cart)}
            </p>

            {getAdjustedStock(product, cart) === 1 && (
              <p className="stock-alert">¡Último disponible!</p>
            )}

            <div className="product-buttons">
              {product.stock === 0 ? (
                <button disabled>Sin stock</button>
              ) : (
                <button
                  disabled={getAdjustedStock(product, cart) === 0}
                  onClick={() => {
                    if (getAdjustedStock(product, cart) === 0) return;
                    addCart(product);
                  }}
                >
                  {getAdjustedStock(product, cart) === 0
                    ? "Sin stock"
                    : "Agregar al carrito"}
                </button>
              )}

              {/* 🔹 Nuevo botón "Ver más" */}
              <button onClick={() => goToProductDetail(product._id)}>
                Ver más
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
