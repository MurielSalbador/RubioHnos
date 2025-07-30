// src/services/serch/productsSerch.js

export const searchProducts = async ({ search }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_SERVER_URL}/api/products`);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const allProducts = await res.json();

    if (!search.trim()) return [];

    return allProducts.filter(product =>
      product.title.toLowerCase().includes(search.toLowerCase())
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

