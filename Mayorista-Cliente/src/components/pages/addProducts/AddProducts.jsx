import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { getCategories } from "../../../api/categoriesApi.js";
import { getBrands } from "../../../api/brandsApi.js";
import { compressImage, getImageUrl } from "../../../utils/image.js";
import "./addProducts.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

const EMPTY_FORM = {
  title: "",
  brand: "",
  price: "",
  stock: "",
  image: null,
  available: false,
  categoryIds: [],
};

function productToForm(productData) {
  let categoryIds = [];
  if (Array.isArray(productData.categoryIds)) {
    categoryIds = productData.categoryIds
      .filter(Boolean)
      .map((c) => (typeof c === "object" ? c._id : c));
  } else if (productData.categoryId) {
    categoryIds = [typeof productData.categoryId === "object" ? productData.categoryId._id : productData.categoryId];
  }

  return {
    title: productData.title ?? "",
    brand: productData.brand ?? "",
    price: productData.price != null ? String(productData.price) : "",
    stock: productData.stock != null ? String(productData.stock) : "",
    available: Boolean(productData.available),
    categoryIds,
    image: null,
  };
}

function ProductForm({ productId, initialProduct, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Categorías y marcas quedan en cache (compartido con la tienda)
  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 1000 * 60 * 10,
  });

  // Liberamos la memoria de las vistas previas locales
  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  useEffect(() => {
    setNewBrand("");
    setNewCategory("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!productId) {
      setPreviewImage(null);
      setFormData(EMPTY_FORM);
      return;
    }

    // Si ya tenemos el producto (desde la lista) lo mostramos al instante
    if (initialProduct && initialProduct._id === productId) {
      setFormData(productToForm(initialProduct));
      setPreviewImage(getImageUrl(initialProduct.imageUrl, 600) || null);
      return;
    }

    let cancelled = false;
    setLoadingProduct(true);
    axios
      .get(`${API_URL}/api/products/${productId}`)
      .then((res) => {
        if (cancelled) return;
        setFormData(productToForm(res.data));
        setPreviewImage(getImageUrl(res.data.imageUrl, 600) || null);
      })
      .catch(() => !cancelled && toast.error("No se pudo cargar el producto"))
      .finally(() => !cancelled && setLoadingProduct(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryToggle = (catId) => {
    setFormData(prev => {
      const isSelected = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: isSelected 
          ? prev.categoryIds.filter(id => id !== catId)
          : [...prev.categoryIds, catId]
      };
    });
  };

  const handleBrandSelect = (brandName) => {
    setFormData(prev => ({ ...prev, brand: brandName }));
    setNewBrand("");
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/categories`, 
        { nombre: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      queryClient.setQueryData(["categories"], (old = []) => [...old, res.data]);
      setFormData(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, res.data._id]
      }));
      setNewCategory("");
      toast.success("Categoría creada y seleccionada");
    } catch {
      toast.error("Error al crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta categoría? Se desvinculará de los productos que la tengan.")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/categories/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      queryClient.setQueryData(["categories"], (old = []) => old.filter((c) => c._id !== catId));
      setFormData(prev => ({
        ...prev,
        categoryIds: prev.categoryIds.filter(id => id !== catId)
      }));
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar la categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || processingImage) return;
    setLoading(true);

    const priceParsed = parseFloat(formData.price);
    const stockParsed = Number(formData.stock);
    const brandToUse = newBrand.trim() || formData.brand;

    if (isNaN(priceParsed) || priceParsed < 0 || isNaN(stockParsed) || stockParsed < 0) {
      toast.error("Ingrese valores de precio y stock válidos");
      setLoading(false);
      return;
    }

    if (!brandToUse) {
      toast.warning("Por favor, seleccioná o escribí una marca");
      setLoading(false);
      return;
    }

    if (formData.categoryIds.length === 0) {
      toast.warning("Por favor, seleccioná al menos una categoría");
      setLoading(false);
      return;
    }

    const formToSend = new FormData();
    formToSend.append("title", formData.title.trim());
    formToSend.append("brand", brandToUse);
    formToSend.append("price", priceParsed);
    formToSend.append("stock", stockParsed);
    formToSend.append("available", formData.available);
    
    // Enviar cada ID del array individualmente como 'categoryIds'
    formData.categoryIds.forEach(id => {
      formToSend.append("categoryIds", id);
    });

    if (formData.image) {
      formToSend.append("image", formData.image);
    }

    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      let res;
      if (productId) {
        res = await axios.put(`${API_URL}/api/products/${productId}`, formToSend, config);
        toast.success("✅ Producto actualizado");
      } else {
        res = await axios.post(`${API_URL}/api/products`, formToSend, config);
        toast.success("✅ Producto agregado");
      }

      if (!productId) {
        setFormData(EMPTY_FORM);
        setPreviewImage(null);
        setNewBrand("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      // Algunos endpoints devuelven { product } y otros el producto directo
      const saved = res?.data?.product || res?.data;
      onSuccess?.(saved && saved._id ? saved : null);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-admin-form-wrapper">
      <div className="admin-form-header">
        <h2>
          {productId ? "Editar Producto" : "Nuevo Producto"}
          {loadingProduct && <small style={{ fontSize: "0.6em", marginLeft: 10, color: "#888" }}>cargando…</small>}
        </h2>
      </div>

      <form className="premium-admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Columna Izquierda: Info Básica */}
          <div className="form-column">
            <div className="form-group">
              <label>Título del Producto</label>
              <input
                name="title"
                placeholder="Ej: Bombilla de Alpaca"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Marca (Seleccioná o escribí una nueva)</label>
              <div className="brand-multi-select">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`cat-chip ${formData.brand === brand && !newBrand ? "active" : ""}`}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
              <div className="add-new-category-inline">
                <input
                  type="text"
                  placeholder="Nueva marca..."
                  value={newBrand}
                  onChange={(e) => {
                    setNewBrand(e.target.value);
                    setFormData(prev => ({ ...prev, brand: "" }));
                  }}
                />
              </div>
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label>Precio ($)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group checkbox-group-modern">
              <label className="available-switch">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                <span className="switch-label">Producto Disponible</span>
              </label>
            </div>
          </div>

          {/* Columna Derecha: Categorías e Imagen */}
          <div className="form-column">
            <div className="form-group">
              <label>Categorías (Seleccioná una o varias)</label>
              <div className="categories-multi-select">
                {categorias.map((cat) => (
                  <div key={cat._id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                    <button
                      type="button"
                      className={`cat-chip ${formData.categoryIds.includes(cat._id) ? "active" : ""}`}
                      onClick={() => handleCategoryToggle(cat._id)}
                      style={{ margin: 0 }}
                    >
                      {cat.nombre}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="Eliminar categoría"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-new-category-inline">
                <input
                  type="text"
                  placeholder="Otra categoría..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                />
                <button type="button" onClick={handleAddNewCategory} className="add-cat-btn">
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Imagen del Producto</label>
              <div className="image-upload-premium">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setProcessingImage(true);
                    // Achicamos la foto antes de subirla: se guarda mucho más rápido
                    const optimized = await compressImage(file);
                    setFormData((prev) => ({ ...prev, image: optimized }));
                    setPreviewImage(URL.createObjectURL(optimized));
                    setProcessingImage(false);
                  }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  {processingImage ? "Optimizando imagen..." : previewImage ? "Cambiar Imagen" : "Subir Imagen"}
                </label>
                {previewImage && (
                  <div className="admin-preview-wrapper">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {productId && (
            <button
              type="button"
              className="admin-submit-btn"
              style={{ background: "#6c757d", flex: 1 }}
              onClick={onCancel}
              disabled={loading}
            >
              Volver Atrás / Cancelar
            </button>
          )}
          <button type="submit" className="admin-submit-btn" style={{ flex: 2 }} disabled={loading || processingImage || loadingProduct}>
            {loading ? "Guardando..." : productId ? "Actualizar Producto" : "Finalizar y Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
