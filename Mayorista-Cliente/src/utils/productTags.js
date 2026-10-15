// Etiquetas de producto (la misma lista que en Mayorista-Server/src/enums/productTags.js)
export const PRODUCT_TAGS = [
  { name: "Sin TACC", emoji: "🌾", short: "Sin TACC" },
  { name: "Vegano", emoji: "🌱", short: "Vegano" },
  { name: "Sin azúcar", emoji: "🚫🍬", short: "Sin azúcar" },
  { name: "Sin lactosa", emoji: "🥛", short: "Sin lactosa" },
  { name: "Orgánico", emoji: "🍃", short: "Orgánico" },
];

export const tagInfo = (name) =>
  PRODUCT_TAGS.find((t) => t.name === name) || { name, emoji: "🏷️", short: name };
