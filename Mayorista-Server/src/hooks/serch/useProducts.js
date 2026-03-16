import { useRef, useState, useMemo, useCallback } from 'react'
import { searchProducts } from '../../services/serch/productsSerch.js'

export function useProducts({ search, sort }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState(null)
  
  // Extra state for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const previousSearch = useRef(search)

  const getProducts = useCallback(async ({ search, newPage = 1, append = false }) => {
    // Si es una busqueda nueva, reseteamos resultados
    if (search !== previousSearch.current && !append) {
       previousSearch.current = search;
       setPage(1);
       newPage = 1;
    }

    try {
      setLoading(true)
      setError(null)
      const data = await searchProducts({ search, page: newPage, limit: 20 })
      
      const newDocs = data.docs || [];
      const total = data.totalPages || 0;

      if (append) {
        setProducts(prev => [...prev, ...newDocs]);
      } else {
        setProducts(newDocs);
      }

      setPage(newPage);
      setTotalPages(total);
      setHasMore(newPage < total);

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      getProducts({ search, newPage: page + 1, append: true });
    }
  }, [hasMore, loading, search, page, getProducts]);


  const sortedProducts = useMemo(() => {
    return sort
      ? [...products].sort((a, b) => a.title.localeCompare(b.title))
      : products
  }, [sort, products])

  return { products: sortedProducts, getProducts, loading, loadMore, hasMore }
}