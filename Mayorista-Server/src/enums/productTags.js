// Etiquetas que se pueden poner a un producto y filtrar en la tienda.
// Si agregás una acá, agregala también en
// Mayorista-Cliente/src/utils/productTags.js
export const PRODUCT_TAGS = ["Sin TACC", "Vegano", "Sin azúcar", "Sin lactosa", "Orgánico"];

// Normaliza lo que manda el formulario (string o array) y descarta lo desconocido
export const parseTags = (value) => {
  if (value === undefined) return undefined;
  const list = Array.isArray(value) ? value : String(value).split(",");
  const clean = list
    .map((t) => String(t).trim())
    .map((t) => PRODUCT_TAGS.find((ok) => ok.toLowerCase() === t.toLowerCase()))
    .filter(Boolean);
  return [...new Set(clean)];
};
