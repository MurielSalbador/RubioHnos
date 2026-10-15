import mongoose from "mongoose";
import Category from '../mongoModels/categories.mongo.js';
import Product from "../mongoModels/products.mongo.js";

const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ nombre: 1 }).lean();
    res.set("Cache-Control", "public, max-age=60");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const nombre = String(req.body?.nombre || "").trim();
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    // Evita duplicados como "Snacks" y "snacks"
    const existing = await Category.findOne({
      nombre: new RegExp(`^${escapeRegex(nombre)}$`, "i"),
    });

    if (existing) return res.status(200).json(existing);

    const newCategory = await Category.create({ nombre });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

// El panel de productos ya tenía el botón para borrar categorías,
// pero esta ruta no existía y siempre daba error.
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de categoría inválido" });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Categoría no encontrada" });

    // Se desvincula de los productos que la tenían
    await Product.updateMany({ categoryIds: id }, { $pull: { categoryIds: id } });

    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};
