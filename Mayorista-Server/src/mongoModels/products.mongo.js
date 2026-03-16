// mongoModels/products.mongo.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  brand:     { type: String, required: true },
  price:     { type: Number, required: true },
  stock:     { type: Number, default: 0 },
  imageUrl:  { type: String },
  available: { type: Boolean, default: false },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
}, {
  timestamps: true
});

// Agregar índices para mejorar el rendimiento de búsqueda y filtros
productSchema.index({ brand: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: 'text' }); // Para búsqueda de texto

const Product = mongoose.model("Product", productSchema);
export default Product;