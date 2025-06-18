// src/api/categoriesApi.js 

export async function getCategories() {
  const response = await fetch("http://localhost:3000/api/categories");
  if (!response.ok) throw new Error("Error al obtener categorías");
  return response.json();
}
