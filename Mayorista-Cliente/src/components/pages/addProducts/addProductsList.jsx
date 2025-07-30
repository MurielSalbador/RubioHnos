import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "./AddProducts.jsx";
import "./addProductsList.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
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
    <div className="container-formAdd">
      <div>
        <ProductForm productId={editingProductId} onSuccess={handleSuccess} />

        <div className="admin-products">
          <h2>Productos Guardados</h2>
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
                  <strong>Disponible:</strong> {product.available ? "Sí" : "No"}
                </p>
                {product.imageUrl && (
                  <img src={`${API_URL}${product.imageUrl}`} alt={product.title} />
                )}
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
  );
}

export default ProductList;
