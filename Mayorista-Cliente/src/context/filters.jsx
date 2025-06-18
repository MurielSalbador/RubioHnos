// context/filters.jsx
import { createContext, useState } from "react";

export const FiltersContext = createContext();

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    category: "all",
    brand: "all",
    minPrice: 0,
    maxPrice: 20000, // o valor máximo que quieras
    sortByPrice: "", // "" | "asc" | "desc"
  });

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

