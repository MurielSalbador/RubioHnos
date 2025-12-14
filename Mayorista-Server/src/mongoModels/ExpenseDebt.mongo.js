// mongoModels/expenseDebt.mongo.js
import mongoose from "mongoose";

const expenseDebtSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amountOwed: {
      type: Number,
      required: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExpenseDebt", expenseDebtSchema);
