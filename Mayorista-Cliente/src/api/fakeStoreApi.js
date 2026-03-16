// src/api/fakeStoreApi.js

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

export async function getAllProducts(filters = {}) {
  const query = new URLSearchParams();

  if (filters.brand && filters.brand.length > 0 && filters.brand !== "all") {
    const brandValue = Array.isArray(filters.brand) ? filters.brand.join(",") : filters.brand;
    query.append("brand", brandValue);
  }

  if (filters.category && filters.category.length > 0 && filters.category !== "all") {
    const categoryValue = Array.isArray(filters.category) ? filters.category.join(",") : filters.category;
    query.append("category", categoryValue);
  }

  if (filters.minPrice) {
    query.append("minPrice", filters.minPrice);
  }

  // 🔥 Soporte para búsqueda desde el backend
  if (filters.search) {
    query.append("search", filters.search);
  }

  // 🔥 Paginación
  query.append("page", filters.page || 1);
  query.append("limit", filters.limit || 20);

  const url = `${API_URL}/api/products?${query.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  const data = await response.json(); // { docs, totalDocs, totalPages, page, limit }

  // 🔽 Ordenamiento después de recibir los productos
  if (filters.sortByPrice === "asc") {
    data.docs.sort((a, b) => a.price - b.price);
  } else if (filters.sortByPrice === "desc") {
    data.docs.sort((a, b) => b.price - a.price);
  }

  return data;
}

// ✅ NUEVA función para obtener un producto por ID
export async function getProductById(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }
  return response.json();
}
