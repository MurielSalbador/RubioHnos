import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "./AddProducts.jsx";
import { FaEdit, FaTrash, FaSearch, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import "./addProductsList.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products?limit=1000`);
      const ordered = (res.data.docs || []).reverse();
      setProducts(ordered);
      setLowStockProducts(ordered.filter((p) => Number(p.stock) === 0));
    } catch (err) {
      console.error("Error al obtener productos:", err);
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleEdit = (id) => {
    setEditingProductId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminarlo?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Producto eliminado correctamente");
      fetchProducts();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      {/* Sección Formulario */}
      <section className="admin-form-section" data-aos="fade-down">
        <ProductForm
          productId={editingProductId}
          onSuccess={() => {
            setEditingProductId(null);
            fetchProducts();
          }}
        />
      </section>

      {/* Sección Listado */}
      <section className="admin-inventory-section">
        <div className="inventory-header">
          <div className="header-text">
            <h2><FaBoxOpen /> Inventario de Productos</h2>
            <p>Gestioná tu stock, precios y categorías</p>
          </div>

          <div className="admin-search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Cargando catálogo...</div>
        ) : (
          <div className="admin-product-grid-premium">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="admin-modern-row"
                data-aos="fade-up"
              >
                <div className="product-visual">
                  <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `${API_URL}/${product.imageUrl}`} alt={product.title} />
                  {!product.available && <span className="badge-offline">Inactivo</span>}
                </div>

                <div className="product-details-admin">
                  <div className="main-meta">
                    <h3>{product.title}</h3>
                    <span className="brand-tag">{product.brand}</span>
                  </div>

                  <div className="category-chips-list">
                    {product.categoryIds && product.categoryIds.length > 0 ? (
                      product.categoryIds.map(cat => (
                        <span key={cat._id} className="admin-cat-chip">
                          {cat.nombre}
                        </span>
                      ))
                    ) : (
                      <span className="admin-cat-chip ghost">Sin categoría</span>
                    )}
                  </div>

                  <div className="stock-price-meta">
                    <div className={`stock-indicator ${product.stock === 0 ? 'zero' : ''}`}>
                      <strong>Stock:</strong> {product.stock}
                    </div>
                    <div className="price-label-admin">
                      ${Number(product.price).toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>

                <div className="admin-row-actions">
                  <button className="edit-action" onClick={() => handleEdit(product._id)}>
                    <FaEdit /> <span>Editar</span>
                  </button>
                  <button className="delete-action" onClick={() => handleDelete(product._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="admin-no-results">
            No se encontraron productos coincidentes.
          </div>
        )}
      </section>

      {/* Alerta Bajo Stock */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-toast">
          <div className="toast-content">
            <span className="warning-icon">⚠️</span>
            <p>Hay <strong>{lowStockProducts.length}</strong> productos sin stock.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
