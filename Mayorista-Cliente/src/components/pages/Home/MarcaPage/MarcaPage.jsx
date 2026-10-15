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
import CartBar from "../../cart/Cart/CartBar.jsx";

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
    content = (
      <div className="marca-status">
        <div style={{ fontSize: "3rem" }}>🫙</div>
        <p>Por ahora no hay productos de esta marca.</p>
        <button className="btn-leaf" onClick={() => navigate("/shop")}>Ver otros productos</button>
      </div>
    );
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

        <div className="marca-hero">
          <span className="marca-eyebrow">Marca</span>
          <h1>{slug.toUpperCase()}</h1>
          {!isLoading && !error && (
            <p>{products.length === 1 ? "1 producto" : `${products.length} productos`}</p>
          )}
        </div>

        {content}

        <ProductModal
          product={selectedProduct}
          onHide={() => setSelectedProduct(null)}
          footer={
            <button className="marca-go-shop" onClick={() => navigate("/shop")}>
              Ver toda la tienda ➔
            </button>
          }
        />
      </div>
      <CartBar />
    </>
  );
}
