// src/services/serch/productsSerch.js

export const searchProducts = async ({ search, page = 1, limit = 20 }) => {
  try {
    const query = new URLSearchParams();
    if (search && search.trim() !== "") {
      query.append("search", search);
    }
    query.append("page", page);
    query.append("limit", limit);

    const res = await fetch(`${import.meta.env.VITE_BASE_SERVER_URL}/api/products?${query.toString()}`);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    // Now it returns { docs, totalDocs, totalPages, page, limit }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { docs: [], totalPages: 0 };
  }
};

