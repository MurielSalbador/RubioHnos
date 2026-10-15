import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFilters } from "../../../../hooks/useFilters.js";
import { getCategories } from "../../../../api/categoriesApi.js";
import { getBrands } from "../../../../api/brandsApi.js";
import { FaTimes, FaChevronDown } from "react-icons/fa";
import { PRODUCT_TAGS } from "../../../../utils/productTags.js";
import { prettyName } from "../../../../utils/text.js";
import "./Filters.css";

const MAX_PRICE = 400000;

function FilterGroup({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button className="filter-header" onClick={() => setOpen(!open)} aria-expanded={open}>
        <h3>
          {title}
          {count > 0 && <span className="filter-count">{count}</span>}
        </h3>
        <FaChevronDown className={`arrow ${open ? "open" : ""}`} />
      </button>
      {open && children}
    </div>
  );
}

export default function Filters({ onClose, isMobile = false }) {
  const { filters, setFilters } = useFilters();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 1000 * 60 * 30,
  });

  const selectedCats = Array.isArray(filters.category) ? filters.category : [];
  const selectedBrands = Array.isArray(filters.brand) ? filters.brand : [];
  const selectedTags = Array.isArray(filters.tags) ? filters.tags : [];
  const maxPrice = filters.maxPrice || MAX_PRICE;

  const toggle = (type, value) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[type]) ? prev[type] : [];
      return {
        ...prev,
        [type]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const clear = () =>
    setFilters((prev) => ({ ...prev, category: [], brand: [], tags: [], minPrice: 0, maxPrice: MAX_PRICE, sortByPrice: "" }));

  return (
    <div className={`filters-sidebar ${isMobile ? "mobile-ver" : ""}`}>
      <div className="filters-top">
        <h2>Filtros</h2>
        {isMobile && (
          <button className="close-drawer-btn" onClick={onClose} aria-label="Cerrar filtros">
            <FaTimes />
          </button>
        )}
      </div>

      <div className="filters-scroll">
        <FilterGroup title="Etiquetas" count={selectedTags.length}>
          <div className="filter-list">
            {PRODUCT_TAGS.map((t) => (
              <label key={t.name} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(t.name)}
                  onChange={() => toggle("tags", t.name)}
                />
                <span className="checkbox-custom"></span>
                {t.name}
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Categorías" count={selectedCats.length}>
          <div className="filter-list">
            {categories.map((category) => (
              <label key={category._id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(category.nombre)}
                  onChange={() => toggle("category", category.nombre)}
                />
                <span className="checkbox-custom"></span>
                {prettyName(category.nombre)}
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Marcas" count={selectedBrands.length} defaultOpen={!isMobile}>
          <div className="filter-list">
            {brands.map((brand) => (
              <label key={brand} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggle("brand", brand)}
                />
                <span className="checkbox-custom"></span>
                {brand}
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Precio máximo" count={maxPrice < MAX_PRICE ? 1 : 0}>
          <div className="price-filter-container">
            <div className="price-range-value">
              {maxPrice >= MAX_PRICE ? "Sin límite" : `Hasta $${Number(maxPrice).toLocaleString("es-AR")}`}
            </div>
            <input
              type="range"
              min="500"
              max={MAX_PRICE}
              step="500"
              value={maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
              aria-label="Precio máximo"
            />
            <div className="price-presets">
              {[2000, 5000, 10000, 20000].map((v) => (
                <button
                  key={v}
                  className={maxPrice === v ? "active" : ""}
                  onClick={() => setFilters((prev) => ({ ...prev, maxPrice: maxPrice === v ? MAX_PRICE : v }))}
                >
                  ${v.toLocaleString("es-AR")}
                </button>
              ))}
            </div>
          </div>
        </FilterGroup>
      </div>

      <div className="drawer-footer">
        <button className="clear-filters-btn" onClick={clear}>Limpiar</button>
        {isMobile && (
          <button className="btn-leaf apply-filters-btn" onClick={onClose}>Ver resultados</button>
        )}
      </div>
    </div>
  );
}
