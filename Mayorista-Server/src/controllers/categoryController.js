import Category from '../mongoModels/categories.mongo.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // sin .findAll()
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

    const existing = await Category.findOne({ nombre });

    if (existing) return res.status(200).json(existing);

    const newCategory = await Category.create({ nombre });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};