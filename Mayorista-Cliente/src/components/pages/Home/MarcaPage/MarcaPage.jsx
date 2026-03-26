import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";

import Header from "../../../header/Header.jsx";
import { useCart } from "../../../../store.js";
import { getAdjustedStock } from "../../../../utils/calculateStock.js";

import "./MarcaPage.css";
// Reutilizamos los elegantes estilos de grid y modal del catálogo
import "../../cart/Cart/ProductList.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function MarcaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const addCart = useCart((state) => state.addCart);
  const removeCart = useCart((state) => state.removeCart);
  const cart = useCart((state) => state.cart);
  const favoritesArray = useCart((state) => state.favorites);
  const toggleFavorite = useCart((state) => state.toggleFavorite);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/products/brand/${slug}`);
      if (!res.ok) throw new Error("No se pudieron obtener los productos");
      return res.json();
    },
  });

  const isFavorite = (id) => favoritesArray.some((fav) => fav._id === id);

  if (isLoading) return <p className="marca-status">Cargando productos de {slug}...</p>;
  if (error) return <p className="marca-status error">{error.message}</p>;
  if (products.length === 0) return <p className="marca-status">No hay productos disponibles para esta marca.</p>;

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

        <div className="modern-product-grid">
          {products.map((product) => {
            const cartItem = cart.find((item) => item._id === product._id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div 
                key={product._id} 
                className="modern-product-card"
                data-aos="fade-up"
              >
                <div className="card-image-wrapper">
                  <img 
                    loading="lazy" 
                    decoding="async" 
                    src={product.imageUrl || product.image || "https://via.placeholder.com/250x150?text=Sin+imagen"} 
                    alt={product.title} 
                    onClick={() => setSelectedProduct(product)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button 
                    className="fav-btn" 
                    onClick={() => toggleFavorite(product)}
                  >
                    {isFavorite(product._id) ? <FaHeart color="#e91e63" /> : <FaRegHeart />}
                  </button>
                </div>

                <div className="card-info">
                  <h3 title={product.title}>{product.title.length > 80 ? `${product.title.slice(0, 80)}...` : product.title}</h3>
                  <p className="card-brand">{product.brand}</p>
                  
                  <div className="card-footer">
                    <p className="card-price">${product.price}</p>
                    
                    {quantity === 0 ? (
                      <button
                        className="add-to-cart-btn"
                        disabled={getAdjustedStock(product, cart) === 0}
                        onClick={() => {
                          addCart(product);
                          toast.success(`¡${product.title.substring(0,20)}... agregado!`, {
                            position: "bottom-right",
                            autoClose: 2000,
                            theme: "colored"
                          });
                        }}
                      >
                        {getAdjustedStock(product, cart) === 0 ? "Sin stock" : "Agregar"}
                      </button>
                    ) : (
                      <div className="quantity-selector-modern">
                        <button 
                          className="qty-btn" 
                          onClick={() => removeCart(product._id)}
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="qty-number">{quantity}</span>
                        <button 
                          className="qty-btn" 
                          disabled={getAdjustedStock(product, cart) === 0}
                          onClick={() => addCart(product)}
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {getAdjustedStock(product, cart) < 5 && getAdjustedStock(product, cart) > 0 && (
                     <span className="low-stock-label">Quedan pocos</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Detalle Móvil */}
        <Modal 
          show={!!selectedProduct} 
          onHide={() => setSelectedProduct(null)} 
          centered 
          contentClassName="premium-product-modal"
        >
          {selectedProduct && (() => {
            const product = selectedProduct;
            const cartItem = cart.find((item) => item._id === product._id);
            const quantity = cartItem ? cartItem.quantity : 0;
            
            return (
              <>
                <Modal.Header closeButton className="modal-borderless">
                </Modal.Header>
                <Modal.Body className="p-0">
                  <div className="modal-product-image">
                    <img src={product.imageUrl || product.image} alt={product.title} />
                    <button 
                      className="modal-fav-btn" 
                      onClick={() => toggleFavorite(product)}
                    >
                      {isFavorite(product._id) ? <FaHeart color="#e91e63" size={24} /> : <FaRegHeart size={24} />}
                    </button>
                  </div>
                  <div className="modal-product-details">
                    <p className="modal-brand">{product.brand}</p>
                    <h3>{product.title}</h3>
                    <p className="modal-price">${product.price}</p>
                    
                    {product.description && (
                      <p className="modal-desc">{product.description}</p>
                    )}
                    
                    <div className="modal-actions">
                      {quantity === 0 ? (
                        <button
                          className="modal-add-btn"
                          disabled={getAdjustedStock(product, cart) === 0}
                          onClick={() => {
                            addCart(product);
                            toast.success(`¡Agregado al carrito!`, {
                              position: "bottom-center",
                              autoClose: 1500,
                              theme: "colored"
                            });
                          }}
                        >
                          {getAdjustedStock(product, cart) === 0 ? "Sin stock" : "Agregar al Carrito"}
                        </button>
                      ) : (
                        <div className="modal-qty-selector">
                          <button 
                            className="mqty-btn" 
                            onClick={() => removeCart(product._id)}
                          >
                            <FaMinus />
                          </button>
                          <span className="mqty-number">{quantity}</span>
                          <button 
                            className="mqty-btn" 
                            disabled={getAdjustedStock(product, cart) === 0}
                            onClick={() => addCart(product)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => navigate('/shop')} 
                        style={{
                          background: 'none', 
                          border: 'none', 
                          color: '#2a9d8f', 
                          fontWeight: '800', 
                          marginTop: '1.5rem', 
                          display: 'block', 
                          width: '100%', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Ir a la Tienda ➔
                      </button>
                    </div>
                  </div>
                </Modal.Body>
              </>
            );
          })()}
        </Modal>

        <ToastContainer />
      </div>
    </>
  );
}
