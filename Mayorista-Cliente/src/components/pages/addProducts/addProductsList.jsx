import { useCallback, useDeferredValue, useEffect, useMemo, useState, memo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductForm from "./AddProducts.jsx";
import { FaEdit, FaTrash, FaSearch, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import { getImageUrl } from "../../../utils/image.js";
import { useInView } from "../../../hooks/useInView.js";
import "./addProductsList.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;
const FETCH_PAGE_SIZE = 200;
const RENDER_STEP = 40;

const ADMIN_PRODUCTS_KEY = ["admin-products"];

// Trae TODO el inventario por páginas (en paralelo) para no depender de un
// límite fijo: antes con ?limit=1000 los productos de más quedaban afuera.
async function fetchAllProducts() {
  const first = await axios.get(`${API_URL}/api/products`, {
    params: { page: 1, limit: FETCH_PAGE_SIZE },
  });
  const totalPages = Number(first.data.totalPages) || 1;
  let docs = first.data.docs || [];

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        axios.get(`${API_URL}/api/products`, {
          params: { page: i + 2, limit: FETCH_PAGE_SIZE },
        })
      )
    );
    for (const res of rest) docs = docs.concat(res.data.docs || []);
  }

  // Sin duplicados (el servidor ya los manda con los más nuevos primero)
  const seen = new Set();
  return docs.filter((p) => (seen.has(p._id) ? false : seen.add(p._id)));
}

const normalize = (text) =>
  (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const AdminProductRow = memo(function AdminProductRow({ product, onEdit, onDelete, isEditing, isDeleting }) {
  const imageUrl = getImageUrl(product.imageUrl, 200);

  return (
    <div className={`admin-modern-row ${isEditing ? "is-editing" : ""} ${isDeleting ? "is-deleting" : ""}`}>
      <div className="product-visual">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} loading="lazy" decoding="async" width="200" height="200" />
        ) : (
          <div className="admin-no-image">Sin imagen</div>
        )}
        {!product.available && <span className="badge-offline">Inactivo</span>}
      </div>

      <div className="product-details-admin">
        <div className="main-meta">
          <h3>{product.title}</h3>
          <span className="brand-tag">{product.brand}</span>
        </div>

        <div className="category-chips-list">
          {Array.isArray(product.categoryIds) && product.categoryIds.length > 0 ? (
            product.categoryIds.map((cat) =>
              cat && typeof cat === "object" ? (
                <span key={cat._id} className="admin-cat-chip">{cat.nombre}</span>
              ) : null
            )
          ) : (
            <span className="admin-cat-chip ghost">Sin categoría</span>
          )}
        </div>

        <div className="stock-price-meta">
          <div className={`stock-indicator ${Number(product.stock) === 0 ? "zero" : ""}`}>
            <strong>Stock:</strong> {product.stock}
          </div>
          <div className="price-label-admin">
            ${Number(product.price).toLocaleString("es-AR")}
          </div>
        </div>
      </div>

      <div className="admin-row-actions">
        <button className="edit-action" onClick={() => onEdit(product)} disabled={isDeleting}>
          <FaEdit /> <span>Editar</span>
        </button>
        <button className="delete-action" onClick={() => onDelete(product)} disabled={isDeleting} aria-label="Eliminar">
          <FaTrash />
        </button>
      </div>
    </div>
  );
});

function ProductList() {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [onlyNoStock, setOnlyNoStock] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RENDER_STEP);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [sentinelRef, sentinelInView] = useInView({ rootMargin: "800px" });

  // La búsqueda filtra en memoria; useDeferredValue mantiene el input fluido
  const deferredSearch = useDeferredValue(search);

  const {
    data: products = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ADMIN_PRODUCTS_KEY,
    queryFn: fetchAllProducts,
    staleTime: 1000 * 30,
  });

  const lowStockCount = useMemo(
    () => products.filter((p) => Number(p.stock) === 0).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = normalize(deferredSearch.trim());
    return products.filter((p) => {
      if (onlyNoStock && Number(p.stock) !== 0) return false;
      if (!term) return true;
      return normalize(p.title).includes(term) || normalize(p.brand).includes(term);
    });
  }, [products, deferredSearch, onlyNoStock]);

  // Al cambiar la búsqueda volvemos a mostrar desde el principio
  useEffect(() => {
    setVisibleCount(RENDER_STEP);
  }, [deferredSearch, onlyNoStock]);

  // Dibujamos de a tandas: con cientos de productos la página no se traba
  useEffect(() => {
    if (sentinelInView && visibleCount < filteredProducts.length) {
      setVisibleCount((c) => c + RENDER_STEP);
    }
  }, [sentinelInView, visibleCount, filteredProducts.length]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY });
    // La tienda y el detalle también se actualizan
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  }, [queryClient]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    async (product) => {
      if (!window.confirm(`¿Seguro que querés eliminar "${product.title}"?`)) return;

      setDeletingIds((prev) => new Set(prev).add(product._id));
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Lo sacamos de la lista al instante, sin recargar todo
        queryClient.setQueryData(ADMIN_PRODUCTS_KEY, (old = []) =>
          old.filter((p) => p._id !== product._id)
        );
        setEditingProduct((current) => (current?._id === product._id ? null : current));
        toast.success("Producto eliminado correctamente");
        refreshAll();
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar");
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
      }
    },
    [queryClient, refreshAll]
  );

  const handleSaved = useCallback(
    (saved) => {
      // Actualizamos la fila en el momento con lo que devolvió el servidor
      if (saved && saved._id) {
        queryClient.setQueryData(ADMIN_PRODUCTS_KEY, (old = []) => {
          const index = old.findIndex((p) => p._id === saved._id);
          if (index === -1) return [saved, ...old];
          const copy = old.slice();
          // Conservamos las categorías "pobladas" si el servidor devolvió solo ids
          const keepCats =
            Array.isArray(saved.categoryIds) && saved.categoryIds.some((c) => typeof c !== "object");
          copy[index] = { ...old[index], ...saved, ...(keepCats ? { categoryIds: old[index].categoryIds } : {}) };
          return copy;
        });
      }
      setEditingProduct(null);
      refreshAll();
    },
    [queryClient, refreshAll]
  );

  return (
    <div className="admin-dashboard-container">
      {/* Sección Formulario */}
      <section className="admin-form-section">
        <ProductForm
          productId={editingProduct?._id || null}
          initialProduct={editingProduct}
          onSuccess={handleSaved}
          onCancel={() => setEditingProduct(null)}
        />
      </section>

      {/* Sección Listado */}
      <section className="admin-inventory-section">
        <div className="inventory-header">
          <div className="header-text">
            <h2><FaBoxOpen /> Inventario de Productos</h2>
            <p>
              Gestioná tu stock, precios y categorías
              {!isLoading && (
                <span className="admin-count">
                  {" "}· {filteredProducts.length} de {products.length}
                  {isFetching && " · actualizando…"}
                </span>
              )}
            </p>
          </div>

          <div className="admin-search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {lowStockCount > 0 && (
          <label className="admin-filter-nostock">
            <input
              type="checkbox"
              checked={onlyNoStock}
              onChange={(e) => setOnlyNoStock(e.target.checked)}
            />
            Ver solo sin stock ({lowStockCount})
          </label>
        )}

        {isLoading ? (
          <div className="admin-loading">Cargando catálogo...</div>
        ) : isError ? (
          <div className="admin-no-results">
            No se pudieron cargar los productos.{" "}
            <button className="admin-retry-btn" onClick={() => refetch()}>Reintentar</button>
          </div>
        ) : (
          <>
            <div className="admin-product-grid-premium">
              {visibleProducts.map((product) => (
                <AdminProductRow
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingProduct?._id === product._id}
                  isDeleting={deletingIds.has(product._id)}
                />
              ))}
            </div>
            <div ref={sentinelRef} style={{ height: 1 }} />
            {visibleCount < filteredProducts.length && (
              <div className="admin-loading">Cargando más…</div>
            )}
          </>
        )}

        {!isLoading && !isError && filteredProducts.length === 0 && (
          <div className="admin-no-results">
            No se encontraron productos coincidentes.
          </div>
        )}
      </section>

      {/* Alerta Bajo Stock */}
      {lowStockCount > 0 && (
        <div className="low-stock-toast">
          <div className="toast-content">
            <span className="warning-icon">⚠️</span>
            <p>Hay <strong>{lowStockCount}</strong> productos sin stock.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
