import Product from "../mongoModels/products.mongo.js";
import Category from "../mongoModels/categories.mongo.js";
import mongoose from "mongoose";

// Escapa caracteres especiales para usar texto del usuario dentro de un RegExp
// (antes buscar algo como "(" o "+" rompía la consulta con un error 500).
const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const MAX_LIMIT = 200;

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
      title: String(title).trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      brand: String(brand).trim(),
      categoryIds: finalCategoryIds,
      available: available === "true" || available === true,
      imageUrl,
    });

    await product.populate("categoryIds", "nombre");
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
    const { brand, category, minPrice, maxPrice, sortByPrice, search } = req.query;

    // Usamos $and para poder combinar varios $or (categorías + búsqueda)
    const conditions = [];

    if (brand && brand !== "all") {
      const brandsArray = brand.split(",").map((b) => b.trim()).filter(Boolean);
      if (brandsArray.length > 0) {
        conditions.push({
          brand: { $in: brandsArray.map((b) => new RegExp(`^${escapeRegex(b)}$`, "i")) },
        });
      }
    }

    if (category && category !== "all") {
      const categoriesArray = category.split(",").map((c) => c.trim()).filter(Boolean);
      const cats = await Category.find({ nombre: { $in: categoriesArray } }).select("_id").lean();
      const catIds = cats.map((c) => c._id);
      // Si la categoría no existe no devolvemos todo el catálogo, sino nada
      conditions.push({
        $or: [{ categoryIds: { $in: catIds } }, { categoryId: { $in: catIds } }],
      });
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if ((!isNaN(min) && min > 0) || !isNaN(max)) {
      const price = {};
      if (!isNaN(min) && min > 0) price.$gte = min;
      if (!isNaN(max)) price.$lte = max;
      conditions.push({ price });
    }

    // 🔥 Búsqueda por nombre o marca
    if (search && search.trim() !== "") {
      const term = new RegExp(escapeRegex(search.trim()), "i");
      conditions.push({ $or: [{ title: term }, { brand: term }] });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    // Siempre hay un orden estable: sin esto, al paginar con skip MongoDB
    // puede repetir o saltear productos entre una página y otra.
    const sort = {};
    if (sortByPrice === "asc") sort.price = 1;
    else if (sortByPrice === "desc") sort.price = -1;
    sort.createdAt = -1;
    sort._id = -1;

    // 🔥 Paginación (con tope para que nadie pida 100.000 productos de golpe)
    const pageNumber = Math.max(parseInt(req.query.page) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), MAX_LIMIT);
    const skip = (pageNumber - 1) * limitNumber;

    // Conteo y consulta en paralelo
    const [totalDocs, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .select("title price brand imageUrl categoryIds available stock slug categoryId createdAt")
        .populate("categoryIds", "nombre")
        .lean(),
    ]);

    res.set("Cache-Control", "public, max-age=15");
    res.json({
      docs: products,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limitNumber),
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (err) {
    console.error("❌ Error en getAllProducts:", err.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// 🔻 Decrementar stock individual
export const decrementStock = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const qty = parseInt(quantity);
    if (!mongoose.Types.ObjectId.isValid(productId) || !(qty > 0)) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({ _id: productId });
      if (!exists) return res.status(404).json({ message: "Producto no encontrado" });
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    res.json({ message: "Stock actualizado", product });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar stock", error });
  }
};

// 🔻 Decrementar múltiples productos
// Cada descuento es atómico (solo se aplica si hay stock suficiente), así dos
// pedidos al mismo tiempo no pueden dejar el stock en negativo. Si algún
// producto falla, se devuelve el stock de los que ya se descontaron.
export const decrementMultipleStock = async (req, res) => {
  const updates = Array.isArray(req.body) ? req.body : [];
  const applied = [];

  try {
    for (const { productId, quantity } of updates) {
      const qty = parseInt(quantity);
      if (!mongoose.Types.ObjectId.isValid(productId) || !(qty > 0)) {
        continue;
      }

      const updated = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      ).lean();

      if (!updated) {
        const product = await Product.findById(productId).select("title").lean();
        if (!product) {
          console.warn(`⚠️ Producto no encontrado: ${productId}`);
          continue;
        }
        // Devolvemos lo descontado hasta ahora
        await Promise.all(
          applied.map((a) => Product.updateOne({ _id: a.productId }, { $inc: { stock: a.qty } }))
        );
        return res.status(400).json({
          message: `Stock insuficiente para ${product.title}`,
        });
      }

      applied.push({ productId, qty });
    }

    res.json({ message: "Stock de productos actualizado" });
  } catch (error) {
    console.error("❌ Error en decrementMultipleStock:", error);
    await Promise.all(
      applied.map((a) => Product.updateOne({ _id: a.productId }, { $inc: { stock: a.qty } }))
    ).catch(() => {});
    res.status(500).json({
      message: "Error al actualizar múltiples productos",
    });
  }
};


// 🔻 Obtener marcas únicas
export const getUniqueBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.set("Cache-Control", "public, max-age=60");
    res.json(
      brands
        .filter((b) => typeof b === "string" && b.trim() !== "")
        .sort((a, b) => a.localeCompare(b, "es"))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔻 Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
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
        ...(title && { title: String(title).trim() }),
        ...(price !== undefined && price !== "" && !isNaN(parseFloat(price)) && { price: parseFloat(price) }),
        ...(stock !== undefined && stock !== "" && !isNaN(parseInt(stock)) && { stock: parseInt(stock) }),
        ...(brand && { brand: String(brand).trim() }),
        ...(finalCategoryIds && { categoryIds: finalCategoryIds }),
        ...(available !== undefined && { available: available === "true" || available === true }),
        ...(imageUrl && { imageUrl }),
      },
      { new: true, runValidators: true }
    ).populate("categoryIds", "nombre");

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de producto inválido" });
    }
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
      brand: new RegExp(`^${escapeRegex(slug)}$`, "i"),
    })
      .sort({ createdAt: -1, _id: -1 })
      .populate("categoryIds", "nombre")
      .lean();

    // Lista vacía (no 404) para que la página muestre "no hay productos"
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos por marca" });
  }
  
};

