// src/api/brandsApi.js
export async function getBrands() {
  const response = await fetch("http://localhost:3000/api/products/brands");
  if (!response.ok) throw new Error("Error al obtener marcas");
  return response.json();
}
