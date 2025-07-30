import { useEffect, useState } from "react";
import axios from "axios";
import CloseButton from "react-bootstrap/CloseButton";
import { useNavigate } from "react-router-dom";
import "./addProducts.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

function ProductForm({ productId, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    stock: "",
    image: null,
    available: false,
    categoryId: "", // categoría
  });

  const [categorias, setCategorias] = useState([]); // categorías desde backend
  const [newCategory, setNewCategory] = useState(""); // Añadir un estado para categoría nueva
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener categorías
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => setCategorias(res.data))
      .catch((error) => console.error("Error al obtener categorías:", error));
  }, []);

  useEffect(() => {
    if (productId) {
      axios.get(`${API_URL}/api/products/${productId}`).then((res) => {
        setFormData({
          ...res.data,
          image: null, // importante: limpiamos el File
        });

        // guardamos la URL actual para previsualizar
        if (res.data.imageUrl) {
          setPreviewImage(`${API_URL}/${res.data.imageUrl}`);
        }
      });
    } else {
      setPreviewImage(null);
      setFormData({
        title: "",
        brand: "",
        price: "",
        stock: "",
        image: null,
        available: false,
        categoryId: "",
      });
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceParsed = parseFloat(parseFloat(formData.price).toFixed(2));
    const stockParsed = Number(formData.stock);

    if (isNaN(priceParsed) || priceParsed < 0) {
      alert("Ingrese un precio válido mayor o igual a 0");
      return;
    }

    if (isNaN(stockParsed) || stockParsed < 0) {
      alert("Ingrese un stock válido mayor o igual a 0");
      return;
    }

    // Aquí definimos categoryIdToSend con categoría seleccionada o nueva
    let categoryIdToSend = formData.categoryId?._id || formData.categoryId;

    if (newCategory.trim() !== "") {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        // Crear categoría nueva en backend
        const res = await axios.post(
          `${API_URL}/api/categories`,
          { nombre: newCategory.trim() },
          config
        );

        categoryIdToSend = res.data._id;
      } catch (error) {
        alert("Error al crear la nueva categoría");
        return;
      }
    }

    if (!categoryIdToSend || typeof categoryIdToSend !== "string") {
      alert("Por favor seleccioná o escribí una categoría válida.");
      setLoading(false);
      return;
    }

console.log("📦 ID categoría final:", categoryIdToSend);

    const formToSend = new FormData();
    formToSend.append("title", formData.title);
    formToSend.append("brand", formData.brand);
    formToSend.append("price", priceParsed);
    formToSend.append("stock", stockParsed);
    formToSend.append("available", formData.available ? "true" : "false");
    formToSend.append("categoryId", categoryIdToSend);

    // Si hay imagen, agregarla
    if (formData.image) {
      formToSend.append("image", formData.image);
    }

    console.log("🧾 Datos a enviar:");
    for (let [key, value] of formToSend.entries()) {
      console.log(`${key}:`, value);
    }

    const token = localStorage.getItem("token");

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (productId) {
        await axios.put(
          `${API_URL}/api/products/${productId}`,
          formToSend,
          config
        );
        alert("✅ Producto actualizado");
      } else {
        await axios.post(`${API_URL}/api/products`, formToSend, config);
        alert("✅ Producto agregado");
      }

      setFormData({
        title: "",
        brand: "",
        price: "",
        stock: "",
        image: null,
        available: false,
        categoryId: "",
      });
      setNewCategory(""); // Limpiar el input de nueva categoría

      onSuccess?.();
    } catch (error) {
      console.error("🛑 Error completo:", error);
    console.error("❌ Error al crear el producto:");
if (error.response) {
  console.error("📨 Backend respondió:", error.response.data);
  alert(`Error: ${error.response.data.error || "Error desconocido"}`);
} else {
  console.error("❌ Error inesperado:", error.message);
  alert("Error inesperado al guardar el producto");
}
      alert("❌ Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-formAdd">
      <div className="contactClose">
        <CloseButton
          aria-label="Cerrar formulario"
          onClick={() => navigate("/shop")}
        />
      </div>

      <form className="product-form-container" onSubmit={handleSubmit}>
        <h2>{productId ? "Editar Producto" : "Agregar Producto"}</h2>

        <label>Título:</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Marca:</label>
        <input
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          required
        />

        <label>Precio:</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />

        <label>Stock:</label>
        <input
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          required
        />

        <label>Imagen:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFormData({ ...formData, image: e.target.files[0] });

            // mostrar preview instantánea si se carga una nueva
            const file = e.target.files[0];
            if (file) {
              setPreviewImage(URL.createObjectURL(file));
            }
          }}
        />

        {previewImage && (
          <div className="preview-container">
            <p>Vista previa de la imagen:</p>
            <img
              src={previewImage}
              alt="Vista previa"
              className="preview-image"
            />
          </div>
        )}

        <label>Categoría existente:</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <label>O escribe una nueva categoría:</label>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
        />

        <label>
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          Disponible
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : productId ? "Actualizar" : "Guardar"}{" "}
          Producto
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
