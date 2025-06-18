import { useEffect, useState } from "react";
import axios from "axios";
import CloseButton from "react-bootstrap/CloseButton";
import { useNavigate } from "react-router-dom";
import "./addProducts.css";

function ProductForm({ productId, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    stock: "",
    imageUrl: "",
    available: false,
    categoryId: "", // 🆕 categoría
  });

  const [categorias, setCategorias] = useState([]); // 🆕 categorías desde backend
  const [newCategory, setNewCategory] = useState(""); // Añadir un estado para categoría nueva
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener categorías
    axios
      .get("http://localhost:3000/api/categories")
      .then((res) => setCategorias(res.data))
      .catch((error) => console.error("Error al obtener categorías:", error));
  }, []);

  useEffect(() => {
    if (productId) {
      axios
        .get(`http://localhost:3000/api/products/${productId}`)
        .then((res) => {
          setFormData(res.data);
        });
    } else {
      setFormData({
        title: "",
        brand: "",
        price: "",
        stock: "",
        imageUrl: "",
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
  let categoryIdToSend = formData.categoryId;

  if (newCategory.trim() !== "") {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Crear categoría nueva en backend
      const res = await axios.post(
        "http://localhost:3000/api/categories",
        { nombre: newCategory.trim() },
        config
      );

      categoryIdToSend = res.data.id;
    } catch (error) {
      alert("Error al crear la nueva categoría");
      return;
    }
  }

  const payload = {
    ...formData,
    price: priceParsed,
    stock: stockParsed,
    categoryId: categoryIdToSend,
  };

  const token = localStorage.getItem("token");

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (productId) {
      await axios.put(
        `http://localhost:3000/api/products/${productId}`,
        payload,
        config
      );
      alert("✅ Producto actualizado");
    } else {
      await axios.post("http://localhost:3000/api/products", payload, config);
      alert("✅ Producto agregado");
    }

    setFormData({
      title: "",
      brand: "",
      price: "",
      stock: "",
      imageUrl: "",
      available: false,
      categoryId: "",
    });
    setNewCategory("");  // Limpiar el input de nueva categoría

    onSuccess?.();
  } catch (error) {
    console.error(error);
    alert("❌ Error al guardar el producto");
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

        <label>URL de imagen:</label>
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        <label>Categoría existente:</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
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

        <button type="submit">
          {productId ? "Actualizar" : "Guardar"} Producto
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
