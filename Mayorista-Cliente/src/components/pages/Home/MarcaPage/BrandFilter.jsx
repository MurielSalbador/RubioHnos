import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BrandFilter() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error(err));
  }, []);

  const onChangeBrand = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    if (brand !== "all") {
      navigate(`/marca/${brand}`);
    } else {
      navigate("/categoriesCarousel");
    }
  };

  return (
    <select value={selectedBrand} onChange={onChangeBrand} className="filter-select">
      <option value="all">Todas las marcas</option>
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>
  );
}
