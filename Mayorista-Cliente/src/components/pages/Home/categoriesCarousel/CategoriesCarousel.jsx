import { categories } from "../categoriesData/categoriesData.js";
import { Link } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./CategoriesCarousel.css"; 

const CategoriesCarousel = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1200, min: 992 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 992, min: 768 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="my-5">
      <h3 className="text-center mb-4">¡Nuestras marcas!</h3>
      <Carousel
        responsive={responsive}
        infinite
        autoPlay
        autoPlaySpeed={3000}
        keyBoardControl
        containerClass="carousel-container"
        itemClass="carousel-item-padding-40-px"
        removeArrowOnDeviceType={["tablet", "mobile"]}
      >
         {categories.map((item, index) => (
        <div
          key={index}
          className="text-center px-3"
          data-aos="zoom-in-up"
          data-aos-duration="800"
          data-aos-delay={index * 300}
        >
          <Link to={`/marca/${item.slug}`}>
            <div className="category-box">
              <img src={item.src} alt={item.alt} className="img-fluid rounded mb-3" />
              <h5 className="category-title">{item.alt}</h5>
            </div>
          </Link>
        </div>
      ))}
      </Carousel>
    </div>
  );
};

export default CategoriesCarousel;
