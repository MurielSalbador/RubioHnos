import mongoose from "mongoose";

const ExpenseDebtSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExpenseDebt", ExpenseDebtSchema);
