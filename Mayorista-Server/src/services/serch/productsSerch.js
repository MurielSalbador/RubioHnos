// src/services/serch/productsSerch.js
import dotenv from "dotenv";
dotenv.config();

export const searchProducts = async ({ search }) => {
  try {
    const res = await fetch(`${process.env.URL}/api/products`) // corregido
    const allProducts = await res.json()

    if (!search.trim()) return []

    return allProducts.filter(product =>
      product.title.toLowerCase().includes(search.toLowerCase())
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
