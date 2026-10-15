import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaInstagram, FaSearch, FaSlidersH, FaTimes, FaCogs, FaLeaf, FaTruck, FaHeart } from "react-icons/fa";
import "animate.css";

import { FiltersProvider } from "../../../context/filters.jsx";
import ProductList from "../cart/Cart/ProductList.jsx";
import CartBar from "../cart/Cart/CartBar.jsx";
import Filters from "../cart/Cart/Filters.jsx";
import Header from "../../header/Header.jsx";
import { useFilters } from "../../../hooks/useFilters.js";
import BackToTop from "../../BackToTop/BackToTop.jsx";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue.js";
import { getCategories } from "../../../api/categoriesApi.js";
import { isAdminOrSuperAdmin } from "../../../utils/auth.js";
import { PRODUCT_TAGS } from "../../../utils/productTags.js";
import { prettyName } from "../../../utils/text.js";

import "./Shop.css";

const DEFAULT_MAX_PRICE = 400000;

function getUserName() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.username || "";
  } catch {
    return "";
  }
}

const ShopContent = () => {
  const [search, setSearch] = useState("");
  // 🔥 Debounce para la búsqueda para no saturar el servidor al escribir
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const { filters, setFilters } = useFilters();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userName = getUserName();
  const [searchParams, setSearchParams] = useSearchParams();

  // Desde el inicio se puede entrar con una categoría elegida (?categoria=Snacks)
  useEffect(() => {
    const cat = searchParams.get("categoria");
    const tag = searchParams.get("etiqueta");
    if (cat || tag) {
      setFilters((prev) => ({
        ...prev,
        ...(cat && { category: [cat] }),
        ...(tag && { tags: [tag] }),
      }));
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
  });

  const selectedCategories = Array.isArray(filters.category) ? filters.category : [];
  const selectedBrands = Array.isArray(filters.brand) ? filters.brand : [];
  const selectedTags = Array.isArray(filters.tags) ? filters.tags : [];

  const toggleTag = (name) =>
    setFilters((prev) => {
      const current = Array.isArray(prev.tags) ? prev.tags : [];
      return { ...prev, tags: current.includes(name) ? current.filter((t) => t !== name) : [...current, name] };
    });
  const hasPriceFilter = filters.maxPrice && filters.maxPrice < DEFAULT_MAX_PRICE;

  const toggleCategory = (nombre) => {
    setFilters((prev) => {
      const current = Array.isArray(prev.category) ? prev.category : [];
      return {
        ...prev,
        category: current.includes(nombre) ? current.filter((c) => c !== nombre) : [...current, nombre],
      };
    });
  };

  const removeFrom = (type, value) =>
    setFilters((prev) => ({ ...prev, [type]: (prev[type] || []).filter((v) => v !== value) }));

  const clearAll = () => {
    setSearch("");
    setFilters((prev) => ({ ...prev, category: [], brand: [], tags: [], maxPrice: DEFAULT_MAX_PRICE, sortByPrice: "" }));
  };

  const activeCount =
    selectedCategories.length + selectedBrands.length + selectedTags.length + (hasPriceFilter ? 1 : 0);

  return (
    <main className="shop-main-layout">
      {/* Bienvenida + buscador */}
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <p className="shop-hero-hello">{userName ? `¡Hola, ${userName}! 👋` : "¡Hola! 👋"}</p>
          <h1>¿Qué se te antoja hoy?</h1>

          <div className="shop-search">
            <FaSearch className="shop-search-icon" />
            <input
              type="search"
              placeholder="Buscá granola, miel, yerba, galletitas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar productos"
            />
            {search && (
              <button className="shop-search-clear" onClick={() => setSearch("")} aria-label="Borrar búsqueda">
                <FaTimes />
              </button>
            )}
          </div>

          <ul className="shop-perks">
            <li><FaLeaf /> 100% natural</li>
            <li><FaTruck /> Envíos a Rosario y zona</li>
            <li><FaHeart /> Elegidos con amor</li>
          </ul>
        </div>
      </section>

      <div className="shop-container">
        {/* Etiquetas rápidas: Sin TACC, Vegano, ... */}
        <div className="shop-tags" role="group" aria-label="Filtrar por etiqueta">
          {PRODUCT_TAGS.map((t) => (
            <button
              key={t.name}
              className={`shop-tag ${selectedTags.includes(t.name) ? "active" : ""}`}
              onClick={() => toggleTag(t.name)}
              aria-pressed={selectedTags.includes(t.name)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Categorías rápidas */}
        {categories.length > 0 && (
          <div className="shop-cats" role="list">
            <button
              className={`shop-cat ${selectedCategories.length === 0 ? "active" : ""}`}
              onClick={() => setFilters((prev) => ({ ...prev, category: [] }))}
            >
              Todo
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`shop-cat ${selectedCategories.includes(cat.nombre) ? "active" : ""}`}
                onClick={() => toggleCategory(cat.nombre)}
              >
                {prettyName(cat.nombre)}
              </button>
            ))}
          </div>
        )}

        <div className="shop-grid-layout">
          {/* Sidebar de Filtros (Escritorio) */}
          <aside className="shop-sidebar">
            <Filters />
          </aside>

          {/* Drawer de Filtros (Mobile) */}
          <div className={`mobile-filters-drawer ${isDrawerOpen ? "open" : ""}`} aria-hidden={!isDrawerOpen}>
            <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>
            <div className="drawer-content" data-lenis-prevent>
              <Filters onClose={() => setIsDrawerOpen(false)} isMobile={true} />
            </div>
          </div>

          <section className="shop-content-area">
            <div className="shop-toolbar">
              <button className="shop-filter-btn" onClick={() => setIsDrawerOpen(true)}>
                <FaSlidersH /> Filtros
                {activeCount > 0 && <span className="shop-filter-count">{activeCount}</span>}
              </button>

              <label className="shop-sort">
                <span>Ordenar</span>
                <select
                  value={filters.sortByPrice || ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortByPrice: e.target.value }))}
                >
                  <option value="">Más nuevos</option>
                  <option value="asc">Menor precio</option>
                  <option value="desc">Mayor precio</option>
                </select>
              </label>
            </div>

            {/* Filtros activos */}
            {(activeCount > 0 || debouncedSearch) && (
              <div className="shop-active-filters">
                {debouncedSearch && (
                  <button onClick={() => setSearch("")}>“{debouncedSearch}” <FaTimes /></button>
                )}
                {selectedTags.map((t) => (
                  <button key={`t-${t}`} onClick={() => removeFrom("tags", t)}>{t} <FaTimes /></button>
                ))}
                {selectedCategories.map((c) => (
                  <button key={`c-${c}`} onClick={() => removeFrom("category", c)}>{prettyName(c)} <FaTimes /></button>
                ))}
                {selectedBrands.map((b) => (
                  <button key={`b-${b}`} onClick={() => removeFrom("brand", b)}>{b} <FaTimes /></button>
                ))}
                {hasPriceFilter && (
                  <button onClick={() => setFilters((p) => ({ ...p, maxPrice: DEFAULT_MAX_PRICE }))}>
                    Hasta ${Number(filters.maxPrice).toLocaleString("es-AR")} <FaTimes />
                  </button>
                )}
                <button className="clear" onClick={clearAll}>Limpiar todo</button>
              </div>
            )}

            <ProductList search={debouncedSearch} />
          </section>
        </div>
      </div>

      <CartBar />

      {isAdminOrSuperAdmin() && (
        <Link to="/addProducts" className="admin-fab" aria-label="Administrar productos">
          <FaCogs />
        </Link>
      )}

      <footer className="footer-shop">
        <div className="footer-content">
          <p>Rubio Hnos © {new Date().getFullYear()} · Tienda natural</p>
          <div className="footer-links">
            <Link to="/contact">Contacto</Link>
            <a href="https://www.instagram.com/rubio.hnos" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </footer>
      <BackToTop />
    </main>
  );
};

const Shop = () => {
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
