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


const Product = mongoose.model("Product", productSchema);
export default Product;