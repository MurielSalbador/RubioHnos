import Product from "../mongoModels/products.mongo.js";
import Category from "../mongoModels/categories.mongo.js";

// 🔻 Crear producto
export const createProduct = async (req, res) => {
  try {
    const { title, price, brand, stock, categoryId, available } = req.body;

    if (!title || !brand) {
      return res.status(400).json({ error: "Faltan campos obligatorios: título o marca" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      title,
      price: parseFloat(price),
      stock: parseInt(stock),
      brand,
      category: categoryId,
      available: available === "true" || available === true,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔻 Obtener todos los productos con filtros
export const getAllProducts = async (req, res) => {
  try {
    const { brand, category, minPrice, maxPrice, sortByPrice } = req.query;

    const query = {};
    if (brand && brand !== "all") {
      query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    }

    if (category && category !== "all") {
      const cat = await Category.findOne({ nombre: { $regex: new RegExp(`^${category}$`, "i") } });
      if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
      query.category = cat._id;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sort = {};
    if (sortByPrice === "asc") sort.price = 1;
    else if (sortByPrice === "desc") sort.price = -1;

    const products = await Product.find(query).sort(sort).populate("category", "nombre");
    res.json(products);
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

  try {
    for (const { productId, quantity } of updates) {
      const product = await Product.findById(productId);
      if (!product) continue;

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.title}` });
      }

      product.stock -= quantity;
      await product.save();
    }

    res.json({ message: "Stock de productos actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar múltiples productos", error });
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
    const product = await Product.findById(id).populate("category", "nombre");
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
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.available !== undefined) {
      updateData.available = updateData.available === "true" || updateData.available === true;
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto actualizado correctamente", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const products = await Product.find({ category: categoryId }).populate("category");
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
    }).populate("category");

    if (!products.length) {
      return res.status(404).json({ error: "No se encontraron productos para esa marca" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos por marca" });
  }
};
