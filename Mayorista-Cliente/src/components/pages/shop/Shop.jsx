import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

const ShopContent = () => {
  const [search, setSearch] = useState("");
  const { filters, setFilters } = useFilters();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_SERVER_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 5))) // Show first 5 for chips
      .catch(err => console.error(err));
  }, []);

  const handleChipClick = (catName) => {
    setFilters(prev => {
      const currentValues = Array.isArray(prev.category) ? prev.category : [];
      const isSelected = currentValues.includes(catName);
      const newValues = isSelected ? [] : [catName]; // Toggle as a chip (single or deselect)
      return { ...prev, category: newValues };
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
          {/* Sidebar de Filtros */}
          <aside className="shop-sidebar">
            <Filters />
          </aside>

          {/* Contenido Principal */}
          <section className="shop-content-area">
            <header className="shop-results-header">
              <h1>Todos los productos</h1>
              
              {/* Chips de Categorías */}
              <div className="category-chips">
                {categories.map(cat => (
                  <button 
                    key={cat._id} 
                    className={`chip ${filters.category.includes(cat.nombre) ? 'active' : ''}`}
                    onClick={() => handleChipClick(cat.nombre)}
                  >
                    {cat.nombre.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Barra de Búsqueda y Ordenar */}
              <div className="shop-controls">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <FaSearch className="search-icon" />
                </div>

                <div className="sort-wrapper">
                  <span>Ordenar por:</span>
                  <select 
                    value={filters.sortByPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortByPrice: e.target.value }))}
                  >
                    <option value="">Destacado</option>
                    <option value="asc">Menos precio</option>
                    <option value="desc">Mayor precio</option>
                  </select>
                </div>
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
      <QueryClientProvider client={queryClient}>
        <FiltersProvider>
          <ShopContent />
        </FiltersProvider>
      </QueryClientProvider>
    </>
  );
};

export default Shop;
