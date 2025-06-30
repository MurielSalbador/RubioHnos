// src/seeders/seedProducts.js
import { Products } from "../models/products.js";

export const seedProducts = async () => {
  const count = await Products.count();
  if (count > 0) return; // ya hay productos, no hace falta cargar nada

  const defaultProducts = [
    {
      title: "Alimento para perro adulto",
      brand: "Purina",
      price: 8500,
      stock: 3,
      imageUrl: "https://jumboargentina.vtexassets.com/arquivos/ids/760143/Alimento-Para-Perros-Pedigree-15-Kg-1-16827.jpg?v=638048145790570000",
      available: true,
      // categoryId: 1,
    },
    {
      title: "Collar antipulgas",
      brand: "Bayer",
      price: 3200,
      stock: 5,
      imageUrl: "https://static.bidcom.com.ar/publicacionesML/productos/COLLA11X/1000x1000-COLLA11N.jpg",
      available: true,
      // categoryId: 2,
    },
    {
      title: "Pelota mordedora para perro",
      brand: "PetToys",
      price: 1500,
      stock: 4,
      imageUrl: "https://d28hi93gr697ol.cloudfront.net/071e89ac-46a5-8ab3/img/Producto/1941/01-1621356792-63212adb63fab.jpeg",
      available: true,
      // categoryId: 3,
    },
    {
      title: "Rascador para gato",
      brand: "CatZone",
      price: 7200,
      stock: 2,
      imageUrl: "https://acdn.mitiendanube.com/stores/002/622/309/products/rascador-arbol-para-gatos1-327dba7cd67c7c9d5916952446020933-640-0.jpg",
      available: true,
      // categoryId: 4,
    },
    {
      title: "Bolso transportador para mascotas",
      brand: "PetCarrier",
      price: 9800,
      stock: 1,
      imageUrl: "https://http2.mlstatic.com/D_NQ_NP_2X_878846-MLA51056043487_082022-F.webp",
      available: true,
      // categoryId: 5,
    }
  ];

  await Products.bulkCreate(defaultProducts);
  console.log("✅ Productos iniciales cargados en la base de datos");
};
