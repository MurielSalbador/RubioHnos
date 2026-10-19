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

// Palabras que indican la etiqueta en el nombre del producto o de su
// categoría. Así el filtro funciona aunque el producto no tenga la
// etiqueta marcada a mano (ej. "Alfajor sin TACC", categoría "Veganos").
export const TAG_KEYWORDS = {
  "Sin TACC": ["sin tacc", "sin gluten", "libre de gluten", "apto celiac", "celiac"],
  "Vegano": ["vegan", "veggie", "plant based", "a base de plantas"],
  "Sin azúcar": ["sin azucar", "sin azucares", "0% azucar", "zero azucar", "sin azucar agregada", "endulzado con stevia", "con stevia"],
  "Sin lactosa": ["sin lactosa", "deslactosad", "libre de lactosa", "sin lacteos"],
  "Orgánico": ["organic", "organico", "agroecolog"],
};
