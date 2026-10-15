import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFilters } from "../../../../hooks/useFilters.js";
import { useInView } from "../../../../hooks/useInView.js";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue.js";
import { getAllProducts } from "../../../../api/fakeStoreApi.js";
import SkeletonCard from "./SkeletonCard.jsx";
import ServerWaking from "../../../ServerWaking/ServerWaking.jsx";
import ProductCard from "./ProductCard.jsx";
import ProductModal from "./ProductModal.jsx";
import "./ProductList.css";
import "./SkeletonCard.css";

const PAGE_SIZE = 24;

export default function ProductList({ search = "" }) {
  const { filters } = useFilters();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sentinelRef, sentinelInView] = useInView();
  // El deslizador de precio cambia muy seguido: esperamos a que se suelte
  const maxPrice = useDebouncedValue(filters.maxPrice, 400);

  // Solo los filtros que realmente se mandan al servidor forman parte de la
  // clave del cache. Así mover controles que no afectan la búsqueda no
  // vuelve a pedir todo.
  const apiFilters = useMemo(
    () => ({
      brand: filters.brand,
      category: filters.category,
      tags: filters.tags,
      minPrice: filters.minPrice,
      maxPrice,
      sortByPrice: filters.sortByPrice,
      search,
    }),
    [filters.brand, filters.category, filters.tags, filters.minPrice, maxPrice, filters.sortByPrice, search]
  );

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", "list", apiFilters],
    queryFn: ({ pageParam }) =>
      getAllProducts({ ...apiFilters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = Number(lastPage?.page) || 1;
      const total = Number(lastPage?.totalPages) || 1;
      return current < total ? current + 1 : undefined;
    },
  });

  // Unimos las páginas evitando duplicados
  const products = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const page of data?.pages || []) {
      for (const product of page?.docs || []) {
        if (!seen.has(product._id)) {
          seen.add(product._id);
          result.push(product);
        }
      }
    }
    return result;
  }, [data]);

  // Scroll infinito: cuando el final de la lista se acerca, pedimos la siguiente página
  useEffect(() => {
    if (sentinelInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [sentinelInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOpen = useCallback((product) => setSelectedProduct(product), []);

  if (isLoading) {
    return (
      <div className="skeleton-product-grid">
        <ServerWaking />
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-container">
        <p className="error-text">Hubo un problema al cargar los productos.</p>
        <div className="load-more-wrapper">
          <button className="load-more-btn" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalDocs = data?.pages?.[0]?.totalDocs;

  return (
    <div className="product-list-container">
      {typeof totalDocs === "number" && totalDocs > 0 && (
        <p className="products-count-label">
          Mostrando {products.length} de {totalDocs} productos
        </p>
      )}

      <div className="modern-product-grid">
        {products.length === 0 ? (
          <div className="no-products-container">
            <div className="no-products-icon">🔎</div>
            <h3>No encontramos resultados</h3>
            <p>Intentá con otros filtros o términos de búsqueda. ¡Tenemos muchas cosas ricas esperándote!</p>
          </div>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              onOpen={handleOpen}
            />
          ))
        )}
        {isFetchingNextPage &&
          [...Array(4)].map((_, i) => <SkeletonCard key={`next-${i}`} />)}
      </div>

      <div ref={sentinelRef} className="load-more-sentinel" />

      {hasNextPage && !isFetchingNextPage && (
        <div className="load-more-wrapper">
          <button className="load-more-btn" onClick={() => fetchNextPage()}>
            Cargar más productos
          </button>
        </div>
      )}

      <ProductModal product={selectedProduct} onHide={() => setSelectedProduct(null)} />
    </div>
  );
}
