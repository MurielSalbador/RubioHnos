import Product from "../mongoModels/products.mongo.js";
import Category from "../mongoModels/categories.mongo.js";
import mongoose from "mongoose";

const getImageUrl = (req) => {
  if (!req.file) return null;


  if (req.file.path && req.file.path.startsWith("http")) {
    return req.file.path;
  }


  if (req.file.secure_url) {
    return req.file.secure_url;
  }

 
  return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
};


// 🔻 Crear producto
export const createProduct = async (req, res) => {
console.log("🛬 LLEGÓ LA REQUEST A createProduct");

  try {
    let { title, price, brand, stock, categoryId, categoryIds, available } = req.body;

    if (!title || !brand) {
      return res.status(400).json({ error: "Faltan campos obligatorios: título o marca" });
    }

    // Normalizar a un array de categoryIds
    let finalCategoryIds = [];
    if (categoryIds) {
      finalCategoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    } else if (categoryId) {
      finalCategoryIds = [categoryId];
    }

    // Validar cada ID
    for (const id of finalCategoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `ID de categoría inválido: ${id}` });
      }
    }

    const imageUrl = getImageUrl(req);

    const product = await Product.create({
      title,
      price: parseFloat(price),
      stock: parseInt(stock),
      brand,
      categoryIds: finalCategoryIds,
      available: available === "true" || available === true,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error en createProduct:", err.message);
    console.error("🔍 Detalles:", err); // ❗️Este log es CLAVE
    res.status(500).json({ error: err.message || "Error desconocido" });
  }
};


// 🔻 Obtener todos los productos con filtros y paginado
export const getAllProducts = async (req, res) => {
  try {
    const { brand, category, minPrice, maxPrice, sortByPrice, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (brand && brand !== "all") {
      const brandsArray = brand.split(",");
      query.brand = brandsArray.length > 1 ? { $in: brandsArray } : { $regex: brand, $options: "i" };
    }

    if (category && category !== "all") {
      const categoriesArray = category.split(",");
      const cats = await Category.find({ nombre: { $in: categoriesArray } }).lean();
      if (cats.length > 0) {
        const catIds = cats.map(c => c._id);
        query.$or = [
          { categoryIds: { $in: catIds } },
          { categoryId: { $in: catIds } }
        ];
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // 🔥 Soporte para búsqueda por texto
    if (search && search.trim() !== "") {
      query.title = { $regex: search, $options: "i" };
    }

    const sort = {};
    if (req.query.sortByPrice === "asc") sort.price = 1;
    else if (req.query.sortByPrice === "desc") sort.price = -1;

    // 🔥 Paginación
    const pageNumber = parseInt(req.query.page) || 1;
    const limitNumber = parseInt(req.query.limit) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    // Ejecutar consulta + lean() + select() para velocidad y ahorro de datos
    const totalDocs = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limitNumber);

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .select("title price brand imageUrl categoryIds available stock slug categoryId")
      .lean();

    // Devolvemos objeto de paginado
    res.json({
      docs: products,
      totalDocs,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔻 Decrementar stock individual
export const decrementStock = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    product.stock -= quantity;
    await product.save();

    res.json({ message: "Stock actualizado", product });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar stock", error });
  }
};

// 🔻 Decrementar múltiples productos
export const decrementMultipleStock = async (req, res) => {
  const updates = req.body;
  console.log("🛒 Updates recibidos en decrementMultipleStock:", updates);

  try {
    for (const { productId, quantity } of updates) {
      console.log(`➡️ Procesando producto ${productId}, cantidad ${quantity}`);
      const product = await Product.findById(productId);

      if (!product) {
        console.warn(`⚠️ Producto no encontrado: ${productId}`);
        continue;
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.title}`,
        });
      }

      product.stock -= quantity;
      await product.save();
      console.log(`✅ Nuevo stock de ${product.title}: ${product.stock}`);
    }

    res.json({ message: "Stock de productos actualizado" });
  } catch (error) {
    console.error("❌ Error en decrementMultipleStock:", error);
    res.status(500).json({
      message: "Error al actualizar múltiples productos",
      error,
    });
  }
};


// 🔻 Obtener marcas únicas
export const getUniqueBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔻 Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("categoryIds", "nombre").lean(); 
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// 🔻 Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, price, brand, stock, categoryId, categoryIds, available } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }

    // Normalizar a un array de categoryIds
    let finalCategoryIds = null;
    if (categoryIds) {
      finalCategoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    } else if (categoryId) {
      finalCategoryIds = [categoryId];
    }

    if (finalCategoryIds) {
      for (const catId of finalCategoryIds) {
        if (!mongoose.Types.ObjectId.isValid(catId)) {
          return res.status(400).json({ error: `ID de categoría inválido: ${catId}` });
        }
      }
    }

    const imageUrl = getImageUrl(req);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(price && { price: parseFloat(price) }),
        ...(stock && { stock: parseInt(stock) }),
        ...(brand && { brand }),
        ...(finalCategoryIds && { categoryIds: finalCategoryIds }),
        ...(available !== undefined && { available: available === "true" || available === true }),
        ...(imageUrl && { imageUrl }),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("❌ Error en updateProduct:", err.message);
    res.status(500).json({ error: err.message || "Error desconocido" });
  }
};

// 🔻 Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No se pudo eliminar" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// 🔻 Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({
      $or: [
        { categoryIds: categoryId },
        { categoryId: categoryId }
      ]
    }).populate("categoryIds", "nombre").lean(); 
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos por categoría" });
  }
};

// 🔻 Obtener productos por marca (slug en lowercase)
export const getProductsByBrand = async (req, res) => {
  try {
    const { slug } = req.params;
    const products = await Product.find({
      brand: { $regex: new RegExp(`^${slug}$`, "i") },
    }).populate("categoryIds", "nombre").lean(); 

    if (!products.length) {
      return res.status(404).json({ error: "No se encontraron productos para esa marca" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos por marca" });
  }
  
};

