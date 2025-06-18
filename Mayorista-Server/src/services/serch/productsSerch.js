// src/services/serch/productsSerch.js

export const searchProducts = async ({ search }) => {
  try {
    const res = await fetch('http://localhost:3000/api/products') // corregido
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
