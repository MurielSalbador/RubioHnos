import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "./AddProducts.jsx";
import "./addProductsList.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);

      // 👉 ordenar del más nuevo al más viejo
      const ordered = res.data
        .map((p) => ({
          ...p,
          stock: Number(p.stock),
        }))
        .reverse();
      console.log("Productos recibidos:", ordered);

      // 👉 filtrar productos con stock bajo
      const lowStock = ordered.filter((p) => p.stock == 0);
      console.log("Productos con bajo stock:", lowStock);

      setProducts(ordered);
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleEdit = (id) => {
    setEditingProductId(id);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "¿Estás seguro que querés eliminar este producto?"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Producto eliminado");
      fetchProducts();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("❌ No se pudo eliminar el producto");
    }
  };

  const handleSuccess = () => {
    setEditingProductId(null);
    fetchProducts();
  };

  // Función para obtener el nombre de la categoría desde el id
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.nombre : "Sin categoría";
  };

  return (
    <>
      <div className="container-formAdd">
        <div>
          <ProductForm productId={editingProductId} onSuccess={handleSuccess} />

          <div className="admin-products">
            <h2 className="title-product-list"> Productos Guardados</h2>

            <div className="admin-products-list">
              {products.map((product) => (
                <div key={product._id} className="admin-product-card">
                  <div className="admin-product-info">
                    <h3>{product.title}</h3>
                    <p>
                      <strong>Marca:</strong> {product.brand}
                    </p>
                    <p>
                      <strong>Categoría:</strong>{" "}
                      {product.categoryId?.nombre || "Sin categoría"}
                    </p>
                    <p>
                      <strong>Precio:</strong> $
                      {Number(product.price).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p>
                      <strong>Stock:</strong> {product.stock}
                    </p>
                    <p>
                      <strong>Disponible:</strong>{" "}
                      {product.available ? "Sí" : "No"}
                    </p>
                    <div className="img-product-list">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.title} />
                    )}
                    </div>
                  </div>

                  <div className="admin-product-actions">
                    <button onClick={() => handleEdit(product._id)}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDelete(product._id)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="lowstock-overlay">
          <div className="lowstock-modal" role="dialog" aria-modal="true">
            <h2>⚠️ Productos con bajo stock</h2>
            <ul>
              {lowStockProducts.map((p) => (
                <li key={p._id}>
                  {p.title} — Stock: {p.stock}
                </li>
              ))}
            </ul>
            <button onClick={() => setLowStockProducts([])}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList;
