// mongoModels/categories.mongo.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  nombre: { type: String, required: true },
}, {
  timestamps: true
});

// Agregar índice de texto para búsquedas rápidas por nombre
categorySchema.index({ nombre: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
