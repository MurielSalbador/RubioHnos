import { useState, useEffect } from "react";
import { useFilters } from "../../../../hooks/useFilters.js";
import { getBrands } from "../../../../api/brandsApi.js";
import { getCategories } from "../../../../api/categoriesApi.js"; // nueva importación

export default function Filters() {
  const { filters, setFilters } = useFilters();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]); // estado para categorías
  const MAX_PRICE = 20000;

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch((err) => console.error(err));
    getCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="filters-box">
      {/* Categoría */}
      <label className="filter-label">
        Categoría:
        <select
          className="filter-select"
          value={filters.category || "all"}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
        >
          <option value="all">Seleccionar categoría...</option>
          {categories.map((category) => (
            <option key={category._id} value={category.nombre}>
              {category.nombre}
            </option>
          ))}
        </select>
      </label>

      {/* Marca */}
      <label className="filter-label">
        Marca:
        <select
          className="filter-select"
          value={filters.brand || "all"}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, brand: e.target.value }))
          }
        >
          <option value="all">Seleccionar marca...</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      {/* Precio mínimo */}
      <label className="filter-label">
        Precio mínimo: ${filters.minPrice}
        <input
          className="filter-slider"
          type="range"
          min="0"
          max={MAX_PRICE}
          step="1"
          value={filters.minPrice}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              minPrice: Number(e.target.value),
            }))
          }
        />
      </label>

      {/* Ordenar precio */}
      <label className="filter-label">
        Ordenar precio:
        <select
          className="filter-select"
          value={filters.sortByPrice || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sortByPrice: e.target.value }))
          }
        >
          <option value="">Sin ordenar</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
      </label>

      <p className="filter-range-text">
        Mostrando productos entre <strong>${filters.minPrice || 0}</strong> y{" "}
        <strong>${filters.maxPrice || MAX_PRICE}</strong>
      </p>
    </section>
  );
}



// import { useState, useEffect } from "react";
// import { useFilters } from "../../../../hooks/useFilters.js";
// import { getBrands } from "../../../../api/brandsApi.js";
// import { getCategories } from "../../../../api/categoriesApi.js";
// import { useNavigate } from "react-router-dom"; // 👈 Importar useNavigate

// export default function Filters() {
//   const { filters, setFilters } = useFilters();
//   const [brands, setBrands] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const navigate = useNavigate(); // 👈 Inicializar
//   const MAX_PRICE = 20000;

//   useEffect(() => {
//     getBrands()
//       .then(setBrands)
//       .catch((err) => console.error(err));
//     getCategories()
//       .then(setCategories)
//       .catch((err) => console.error(err));
//   }, []);

//   const handleBrandChange = (e) => {
//     const brand = e.target.value;
//     setFilters((prev) => ({ ...prev, brand }));

//     if (brand !== "all") {
//       navigate(`/marca/${brand}`);
//     } else {
//       navigate("/categoriesCarousel");
//     }
//   };

//   return (
//     <section className="filters-box">
//       {/* Categoría */}
//       <label className="filter-label">
//         Categoría:
//         <select
//           className="filter-select"
//           value={filters.category || "all"}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, category: e.target.value }))
//           }
//         >
//           <option value="all">Seleccionar categoría...</option>
//           {categories.map((category) => (
//             <option key={category.id} value={category.nombre}>
//               {category.nombre}
//             </option>
//           ))}
//         </select>
//       </label>

//       {/* Marca */}
//       <label className="filter-label">
//         Marca:
//         <select
//           className="filter-select"
//           value={filters.brand || "all"}
//           onChange={handleBrandChange}
//         >
//           <option value="all">Seleccionar marca...</option>
//           {brands.map((brand) => (
//             <option key={brand} value={brand}>
//               {brand}
//             </option>
//           ))}
//         </select>
//       </label>

//       {/* Precio mínimo */}
//       <label className="filter-label">
//         Precio mínimo: ${filters.minPrice}
//         <input
//           className="filter-slider"
//           type="range"
//           min="0"
//           max={MAX_PRICE}
//           step="1"
//           value={filters.minPrice}
//           onChange={(e) =>
//             setFilters((prev) => ({
//               ...prev,
//               minPrice: Number(e.target.value),
//             }))
//           }
//         />
//       </label>

//       {/* Ordenar precio */}
//       <label className="filter-label">
//         Ordenar precio:
//         <select
//           className="filter-select"
//           value={filters.sortByPrice || ""}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, sortByPrice: e.target.value }))
//           }
//         >
//           <option value="">Sin ordenar</option>
//           <option value="asc">Menor a mayor</option>
//           <option value="desc">Mayor a menor</option>
//         </select>
//       </label>

//       <p className="filter-range-text">
//         Mostrando productos entre <strong>${filters.minPrice || 0}</strong> y{" "}
//         <strong>${filters.maxPrice || MAX_PRICE}</strong>
//       </p>
//     </section>
//   );
// }
