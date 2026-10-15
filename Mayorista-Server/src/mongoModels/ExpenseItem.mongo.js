// mongoModels/expenseItem.mongo.js
import mongoose from "mongoose";

const expenseItemSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
});

expenseItemSchema.index({ expenseId: 1 });
export default mongoose.model("ExpenseItem", expenseItemSchema);
