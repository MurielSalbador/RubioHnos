import { Sequelize, Op } from "sequelize";
import { sequelize } from "../db.js";
import { Products } from "../models/products.js";
import { Categories } from "../models/categories.js";

// Decerementar stock
export const decrementStock = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Products.findByPk(productId);
    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });

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

//decrementacion multiple
export const decrementMultipleStock = async (req, res) => {
  const updates = req.body;

  try {
    console.log("Recibido para actualizar stock:", updates);

    for (const { productId, quantity } of updates) {
      const product = await Products.findByPk(productId);
      if (!product) {
        console.log(`Producto con ID ${productId} no encontrado`);
        continue;
      }

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: `Stock insuficiente para ${product.title}` });
      }

      product.stock -= quantity;
      await product.save();
      console.log(`Nuevo stock de ${product.title}: ${product.stock}`);
    }

    res.json({ message: "Stock de productos actualizado" });
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar múltiples productos", error });
  }
};

// Crear producto

export const createProduct = async (req, res) => {
  try {
    const { title, price, brand, stock, categoryId, available } = req.body;

    if (!title || !brand) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: título o marca" });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    const parsedCategoryId = parseInt(categoryId);
    const parsedAvailable = available === "true";

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: "Stock inválido" });
    }

    // Si se subió archivo, construir la URL local
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Products.create({
      title,
      price: parsedPrice,
      stock: parsedStock,
      brand,
      categoryId: parsedCategoryId,
      available: parsedAvailable,
      imageUrl,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Obtener productos con filtros

export const getAllProducts = async (req, res) => {
  try {
    const { brand, category, minPrice, maxPrice, sortByPrice } = req.query;
    console.log("Filtros recibidos:", {
      brand,
      category,
      minPrice,
      maxPrice,
      sortByPrice,
    });

    const where = {};

    if (brand && brand !== "all") {
      where.brand = Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("brand")),
        brand.toLowerCase()
      );
    }

    if (category && category !== "all") {
      console.log("Categories:", Categories);

      const cat = await Categories.findOne({
        where: Sequelize.where(
          Sequelize.fn("lower", Sequelize.col("nombre")),
          category.toLowerCase()
        ),
      });

      if (!cat) {
        console.log("Categoría no encontrada:", category);
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      where.categoryId = cat.id;
    }

    if (minPrice && maxPrice) {
      where.price = { [Op.between]: [Number(minPrice), Number(maxPrice)] };
    } else if (minPrice) {
      where.price = { [Op.gte]: Number(minPrice) };
    } else if (maxPrice) {
      where.price = { [Op.lte]: Number(maxPrice) };
    }

    let order = [];
    if (sortByPrice === "asc") order.push(["price", "ASC"]);
    else if (sortByPrice === "desc") order.push(["price", "DESC"]);

    console.log("Consulta Sequelize - where:", where, "order:", order);

    const products = await Products.findAll({
      where,
      order,
      include: [
        {
          model: Categories,
          attributes: ["id", "nombre"],
        },
      ],
    });

    res.json(products);
  } catch (err) {
    console.error("❌ Error en getAllProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener marcas únicas
export const getUniqueBrands = async (req, res) => {
  try {
    const brands = await Products.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("brand")), "brand"]],
    });

    const brandList = brands.map((b) => b.brand);
    res.json(brandList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Products.findByPk(id);
  if (!product)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (req.file) {
    updatedData.imageUrl = `/uploads/${req.file.filename}`;
  }

  const [updated] = await Products.update(updatedData, { where: { id } });
  if (!updated) return res.status(404).json({ error: "No se pudo actualizar" });

  res.json({ message: "Producto actualizado" });
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const deleted = await Products.destroy({ where: { id } });
  if (!deleted) return res.status(404).json({ error: "No se pudo eliminar" });
  res.json({ message: "Producto eliminado" });
};

// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Products.findAll({
      where: { categoryId },
      include: [{ model: Categories }],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos por categoría" });
  }
};

export const getProductsByBrand = async (req, res) => {
  const { slug } = req.params;

  try {
    const products = await Products.findAll({
      where: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("brand")),
        slug.toLowerCase()
      ),
      include: [{ model: Categories }],
    });

    if (!products.length)
      return res.status(404).json({ error: "No se encontraron productos para esa marca" });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos por marca" });
  }
};