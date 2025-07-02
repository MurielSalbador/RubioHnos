// src/api/fakeStoreApi.js

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

export async function getAllProducts(filters = {}) {
  const query = new URLSearchParams();

  if (filters.brand && filters.brand !== "all") {
    query.append("brand", filters.brand);
  }

  if (filters.category && filters.category !== "all") {
    query.append("category", filters.category);
  }

  if (filters.minPrice) {
    query.append("minPrice", filters.minPrice);
  }

  const url = `${API_URL}/api/products?${query.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  const data = await response.json();

  // 🔽 Ordenamiento después de recibir los productos
  if (filters.sortByPrice === "asc") {
    data.sort((a, b) => a.price - b.price);
  } else if (filters.sortByPrice === "desc") {
    data.sort((a, b) => b.price - a.price);
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
