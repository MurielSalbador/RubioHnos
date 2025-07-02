// src/api/categoriesApi.js 

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error("Error al obtener categorías");
  return response.json();
}
