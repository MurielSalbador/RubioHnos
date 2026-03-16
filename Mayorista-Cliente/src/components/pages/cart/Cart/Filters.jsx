import { useState, useEffect } from "react";
import { useFilters } from "../../../../hooks/useFilters.js";
import { getBrands } from "../../../../api/brandsApi.js";
import { getCategories } from "../../../../api/categoriesApi.js";
import "./Filters.css";

export default function Filters() {
  const { filters, setFilters } = useFilters();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTagsOpen, setIsTagsOpen] = useState(true);

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch((err) => console.error(err));
    getCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  const handleCheckboxChange = (type, value) => {
    setFilters((prev) => {
      const currentValues = Array.isArray(prev[type]) ? prev[type] : [];
      const isSelected = currentValues.includes(value);
      
      const newValues = isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return { ...prev, [type]: newValues };
    });
  };

  return (
    <aside className="filters-sidebar">
      <div className="filter-group">
        <div className="filter-header" onClick={() => setIsTagsOpen(!isTagsOpen)}>
          <h3>Etiquetas</h3>
          <span className={`arrow ${isTagsOpen ? 'open' : ''}`}>&#9662;</span>
        </div>
        
        {isTagsOpen && (
          <div className="filter-list">
            {categories.map((category) => (
              <label key={category._id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(category.nombre)}
                  onChange={() => handleCheckboxChange("category", category.nombre)}
                />
                <span className="checkbox-custom"></span>
                {category.nombre.charAt(0).toUpperCase() + category.nombre.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-header">
          <h3>Marcas</h3>
        </div>
        <div className="filter-list">
          {brands.map((brand) => (
            <label key={brand} className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={filters.brand?.includes(brand)}
                onChange={() => handleCheckboxChange("brand", brand)}
              />
              <span className="checkbox-custom"></span>
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-header">
          <h3>Precio máximo</h3>
        </div>
        <div className="price-filter">
          <input
            type="range"
            min="0"
            max="100000"
            step="500"
            value={filters.maxPrice || 100000}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Number(e.target.value),
              }))
            }
          />
          <div className="price-values">
            <span>$0</span>
            <span>${filters.maxPrice || 100000}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
