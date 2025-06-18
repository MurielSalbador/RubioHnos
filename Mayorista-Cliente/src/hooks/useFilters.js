// hooks/useFilters.js

import { useContext } from "react";
import { FiltersContext } from "../context/filters.jsx";

export function useFilters() {
  const { filters, setFilters } = useContext(FiltersContext);

  const filterProducts = (products) => {
    let filtered = products.filter((product) => {
      return (
        (filters.category === "all" || product.category === filters.category) &&
        product.price >= filters.minPrice
      );
    });

    // 👇 Agrega el ordenamiento por precio
    if (filters.sortByPrice === "asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortByPrice === "desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  return { filters, setFilters, filterProducts };
}
