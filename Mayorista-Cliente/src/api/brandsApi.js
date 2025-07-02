// src/api/brandsApi.js

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

export async function getBrands() {
  const response = await fetch(`${API_URL}/api/products/brands`);
  if (!response.ok) throw new Error("Error al obtener marcas");
  return response.json();
}
