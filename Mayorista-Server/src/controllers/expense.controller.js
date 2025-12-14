// controllers/expense.controller.js
import Expense from "../mongoModels/Expense.mongo.js"

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  const expenses = await Expense.find()
    .populate("paidBy", "username email")
    .sort({ createdAt: -1 });

  res.json(expenses);
};

export const updateExpenseStatus = async (req, res) => {
  const { status } = req.body;

  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(expense);
};
