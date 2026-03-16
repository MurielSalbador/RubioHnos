import { useFilters } from "../../../../hooks/useFilters.js";
import { getCategories } from "../../../../api/categoriesApi.js";
import { FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import "./Filters.css";

export default function Filters({ onClose, isMobile = false }) {
  const { filters, setFilters, clearFilters } = useFilters();
  const [categories, setCategories] = useState([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [internalSearch, setInternalSearch] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
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
    <aside className={`filters-sidebar ${isMobile ? 'mobile-ver' : ''}`}>
      {isMobile && (
        <div className="drawer-header">
          <button className="close-drawer-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="drawer-search-wrapper">
             <input 
               type="text" 
               placeholder="Buscar..." 
               value={internalSearch}
               onChange={(e) => setInternalSearch(e.target.value)}
             />
             <FaSearch className="drawer-search-icon" />
          </div>
        </div>
      )}

      <div className="filter-group">
        <div className="filter-header" onClick={() => setIsTagsOpen(!isTagsOpen)}>
          <h3>Etiquetas</h3>
          <FaChevronDown className={`arrow ${isTagsOpen ? 'open' : ''}`} />
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
                {category.nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-header" onClick={() => setIsPriceOpen(!isPriceOpen)}>
          <h3>Rango de precio</h3>
          <FaChevronDown className={`arrow ${isPriceOpen ? 'open' : ''}`} />
        </div>
        {isPriceOpen && (
          <div className="price-filter-container">
            <div className="price-range-labels">
               <span>$ 0.50</span>
               <span>$ {filters.maxPrice || "366,363.63"}</span>
            </div>
            <input
              type="range"
              min="0"
              max="400000"
              step="100"
              value={filters.maxPrice || 400000}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: Number(e.target.value),
                }))
              }
            />
          </div>
        )}
      </div>

      <div className="drawer-footer">
         <button className="clear-filters-btn" onClick={() => {
            if (clearFilters) clearFilters();
            else setFilters({ category: [], brand: [], maxPrice: 400000 });
         }}>
            Eliminar filtros
         </button>
      </div>
    </aside>
  );
}
