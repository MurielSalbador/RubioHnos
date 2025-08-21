import { useFilters } from "../../../../hooks/useFilters.js";
import useProductNavigation from "../../../../hooks/useProductNavigation/useProductNavigation.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";
import "./ProductList.css";

export default function ProductList({ search = "" }) {
  const { filters } = useFilters();
  const { goToProductDetail } = useProductNavigation();
  const addCart = useCart((state) => state.addCart);
  const cart = useCart((state) => state.cart);
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getAllProducts(filters),
  });

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos</p>;

  

  // 🔹 Filtrado según buscador
  const filteredProducts = products.filter((product) => {
    const title = product.title?.toLowerCase() || "";
    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const term = search.toLowerCase();
    return (
      title.includes(term) || brand.includes(term) || category.includes(term)
    );
  });

  return (
    <div className="product-grid">
      {filteredProducts.length === 0 ? (
        <p>No se encontraron productos</p>
      ) : (
        filteredProducts.map((product) => (
          <div key={product._id || product.id} className="product-card">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.title} />
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

                <button onClick={() => goToProductDetail(product._id)}>
                  Ver más
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
