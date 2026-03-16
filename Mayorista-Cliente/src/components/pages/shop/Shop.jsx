import { FaInstagram, FaSearch, FaCogs } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "animate.css";

//cart
import { FiltersProvider } from "../../../context/filters.jsx";
import ProductList from "../cart/Cart/ProductList.jsx";
import Cart from "../cart/Cart/Cart.jsx";
import Filters from "../cart/Cart/Filters.jsx";
import Header from "../../header/Header.jsx";
import { useFilters } from "../../../hooks/useFilters.js";

//protected
import { isAdminOrSuperAdmin } from "../../../utils/auth.js";

//styles
import "./Shop.css";

const ShopContent = () => {
  const [search, setSearch] = useState("");
  const { filters, setFilters } = useFilters();
  const [brands, setBrands] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_SERVER_URL}/api/products/brands`)
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(err => console.error(err));
  }, []);

  const handleChipClick = (brandName) => {
    setFilters(prev => {
      const currentValues = Array.isArray(prev.brand) ? prev.brand : [];
      const isSelected = currentValues.includes(brandName);
      const newValues = isSelected ? [] : [brandName];
      return { ...prev, brand: newValues };
    });
  };

  return (
    <main className="shop-main-layout">
      <div className="shop-container">
        {/* Banner Informativo */}
        <div className="info-banner">
          <div className="info-icon">i</div>
          <p>Los productos son 100% NATURALES y seleccionados con amor.</p>
        </div>

        <div className="shop-grid-layout">
          {/* Sidebar de Filtros (Escritorio) */}
          <aside className="shop-sidebar">
            <Filters />
          </aside>

          {/* Drawer de Filtros (Mobile) */}
          <div className={`mobile-filters-drawer ${isDrawerOpen ? 'open' : ''}`}>
             <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>
             <div className="drawer-content">
                <Filters onClose={() => setIsDrawerOpen(false)} isMobile={true} />
             </div>
          </div>

          {/* Contenido Principal */}
          <section className="shop-content-area">
            <header className="shop-results-header">
              <h1>Todos los productos</h1>
              
              {/* Chips de Marcas */}
              <div className="category-chips">
                {brands.map(brand => (
                  <button 
                    key={brand} 
                    className={`chip ${filters.brand.includes(brand) ? 'active' : ''}`}
                    onClick={() => handleChipClick(brand)}
                  >
                    {brand.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Barra de Controles (Rediseñada para Mobile/Desktop) */}
              <div className="shop-controls">
                <div className="mobile-search-btn">
                   <FaSearch />
                </div>
                
                <div className="desktop-search-input">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <FaSearch className="search-icon" />
                </div>

                <div className="sort-wrapper">
                  <select 
                    value={filters.sortByPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortByPrice: e.target.value }))}
                  >
                    <option value="">Ordenar por</option>
                    <option value="asc">Menos precio</option>
                    <option value="desc">Mayor precio</option>
                  </select>
                </div>

                <button className="mobile-filters-trigger" onClick={() => setIsDrawerOpen(true)}>
                   <FaCogs /> Filtros
                </button>
              </div>
            </header>

            <div className="products-grid-wrapper">
              <ProductList search={search} />
            </div>
          </section>
        </div>
      </div>

      <Cart />

      {isAdminOrSuperAdmin() && (
        <Link to="/addProducts" className="admin-fab">
          <FaCogs />
        </Link>
      )}

      <footer className="footer-shop">
         <div className="footer-content">
            <p>RubioHnos © 2025 - Tienda Natural</p>
            <div className="footer-links">
               <a href="https://www.instagram.com/rubio.hnos" target="_blank" rel="noreferrer"><FaInstagram /></a>
            </div>
         </div>
      </footer>
    </main>
  );
};

const Shop = () => {
  return (
    <RouterSafeShop />
  );
};

const RouterSafeShop = () => {
  return (
    <>
      <Header />
      <FiltersProvider>
        <ShopContent />
      </FiltersProvider>
    </>
  );
};

export default Shop;
