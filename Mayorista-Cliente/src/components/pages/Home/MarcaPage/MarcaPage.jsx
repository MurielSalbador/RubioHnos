import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Header from "../../../header/Header.jsx";
import ProductCard from "../../cart/Cart/ProductCard.jsx";
import ProductModal from "../../cart/Cart/ProductModal.jsx";
import SkeletonCard from "../../cart/Cart/SkeletonCard.jsx";

import "./MarcaPage.css";
// Reutilizamos los elegantes estilos de grid y modal del catálogo
import "../../cart/Cart/ProductList.css";
import "../../cart/Cart/SkeletonCard.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function MarcaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", "brand", slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/products/brand/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("No se pudieron obtener los productos");
      return res.json();
    },
  });

  const handleOpen = useCallback((product) => setSelectedProduct(product), []);

  let content;
  if (isLoading) {
    content = (
      <div className="skeleton-product-grid">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  } else if (error) {
    content = <p className="marca-status error">{error.message}</p>;
  } else if (products.length === 0) {
    content = <p className="marca-status">No hay productos disponibles para esta marca.</p>;
  } else {
    content = (
      <div className="modern-product-grid">
        {products.map((product, index) => (
          <ProductCard key={product._id} product={product} index={index} onOpen={handleOpen} />
        ))}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="marca-page-container">
        <button className="marca-back-button" onClick={() => window.history.back()}>
          ← Volver
        </button>

        <div className="marca-product-title">
          <h2>Explorá productos de: <span>{slug}</span></h2>
        </div>

        {content}

        <ProductModal
          product={selectedProduct}
          onHide={() => setSelectedProduct(null)}
          footer={
            <button
              onClick={() => navigate("/shop")}
              style={{
                background: "none",
                border: "none",
                color: "#2a9d8f",
                fontWeight: "800",
                marginTop: "1.5rem",
                display: "block",
                width: "100%",
                textAlign: "center",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Ir a la Tienda ➔
            </button>
          }
        />
      </div>
    </>
  );
}
