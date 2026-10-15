// Etiquetas de producto (la misma lista que en Mayorista-Server/src/enums/productTags.js)
export const PRODUCT_TAGS = [
  { name: "Sin TACC", short: "Sin TACC" },
  { name: "Vegano", short: "Vegano" },
  { name: "Sin azúcar", short: "Sin azúcar" },
  { name: "Sin lactosa", short: "Sin lactosa" },
  { name: "Orgánico", short: "Orgánico" },
];

export const tagInfo = (name) => PRODUCT_TAGS.find((t) => t.name === name) || { name, short: name };
