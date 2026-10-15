// context/filters.jsx
import { createContext, useState } from "react";

export const FiltersContext = createContext();

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    minPrice: 0,
    maxPrice: 400000, // 400000 = sin límite (ver MAX_PRICE_FILTER)
    sortByPrice: "", // "" | "asc" | "desc"
  });

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

