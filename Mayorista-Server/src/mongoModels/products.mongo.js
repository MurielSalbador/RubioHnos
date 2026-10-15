// mongoModels/products.mongo.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  brand:     { type: String, required: true },
  price:     { type: Number, required: true },
  stock:     { type: Number, default: 0 },
  imageUrl:  { type: String },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  available: { type: Boolean, default: false },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  }],
}, {
  timestamps: true
});

// Agregar índices para mejorar el rendimiento de búsqueda y filtros
productSchema.index({ brand: 1 });
productSchema.index({ categoryIds: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: 'text' }); // Para búsqueda de texto
// Orden por defecto del listado (más nuevos primero) y orden por precio
productSchema.index({ createdAt: -1, _id: -1 });
productSchema.index({ price: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;