//calcular el stoks de la marcaPage y el de productList
// utils/calculateStock.js
export function getAdjustedStock(product, cart) {
  const itemInCart = cart.find((item) => item._id === product._id);
  const quantityInCart = itemInCart?.quantity || 0;
  return product.stock - quantityInCart;
}
