// mongoModels/expense.mongo.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // "Compra supermercado"
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
