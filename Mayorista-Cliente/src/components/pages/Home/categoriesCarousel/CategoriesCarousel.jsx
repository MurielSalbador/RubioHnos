import { Link } from "react-router-dom";
import { categories as brands } from "../categoriesData/categoriesData.js";
import "./CategoriesCarousel.css";

// Cinta de logos que se desliza sola (solo CSS, sin librerías).
// Antes cada logo tenía una animación con retraso creciente y los últimos
// tardaban más de 9 segundos en aparecer: la sección se veía vacía.
const BrandsMarquee = () => {
  const loop = [...brands, ...brands];

  return (
    <div className="brands-marquee" aria-label="Marcas">
      <div className="brands-track">
        {loop.map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            to={`/marca/${item.slug}`}
            className="brand-logo"
            aria-hidden={index >= brands.length}
            tabIndex={index >= brands.length ? -1 : 0}
          >
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsMarquee;
