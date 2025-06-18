import { Categories } from '../models/categories.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// controllers/categoryController.js
export const createCategory = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    const [category, created] = await Categories.findOrCreate({
      where: { nombre },
    });

    res.status(created ? 201 : 200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};