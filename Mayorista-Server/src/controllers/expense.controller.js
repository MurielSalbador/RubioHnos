// controllers/expense.controller.js
import Expense from "../mongoModels/Expense.mongo.js"
import ExpenseDebt from "../mongoModels/ExpenseDebt.mongo.js";
import ExpenseItem from "../mongoModels/ExpenseItem.mongo.js";

export const createExpense = async (req, res) => {
  try {
    const { title, paidBy, notes, products = [], debts = [] } = req.body;

    const cleanProducts = products.filter(
      p => p.productName && Number(p.price) > 0
    );

    if (cleanProducts.length === 0) {
      return res.status(400).json({
        error: "El gasto debe tener al menos un producto válido",
      });
    }

    const totalAmount = cleanProducts.reduce(
      (acc, p) => acc + Number(p.price),
      0
    );

    const status = debts.length === 0 ? "paid" : "pending";

    const expense = await Expense.create({
      title,
      paidBy: paidBy || null,
      notes,
      totalAmount,
      status,
    });

    await ExpenseItem.insertMany(
      cleanProducts.map(p => ({
        productName: p.productName,
        price: Number(p.price),
        expenseId: expense._id,
      }))
    );

    if (debts.length > 0) {
      await ExpenseDebt.insertMany(
        debts.map(d => ({
          expenseId: expense._id,
          userId: d.userId,
          amountOwed: d.amountOwed,
        }))
      );
    }

    res.status(201).json(expense);

  } catch (err) {
    console.error("🔥 createExpense error:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getExpenses = async (req, res) => {
  const expenses = await Expense.find();

  const result = await Promise.all(
    expenses.map(async exp => {
      const debts = await ExpenseDebt.find({ expenseId: exp._id });
      const items = await ExpenseItem.find({ expenseId: exp._id });

      return { ...exp.toObject(), debts, items };
    })
  );

  res.json(result);
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

export const payDebt = async (req, res) => {
  const { amount } = req.body;

  const debt = await ExpenseDebt.findById(req.params.id);
  debt.amountPaid += Number(amount);

  if (debt.amountPaid >= debt.amountOwed) {
    debt.status = "paid";
  }

  await debt.save();

  await recalcExpenseStatus(debt.expenseId);

  res.json(debt);
};


export const recalcExpenseStatus = async (expenseId) => {
  const debts = await ExpenseDebt.find({ expenseId });

  const allPaid = debts.every(d => d.status === "paid");
  const somePaid = debts.some(d => d.amountPaid > 0);

  let status = "pending";
  if (allPaid) status = "paid";
  else if (somePaid) status = "partial";

  await Expense.findByIdAndUpdate(expenseId, { status });
};


export const deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  await ExpenseDebt.deleteMany({ expenseId: req.params.id });
  await ExpenseItem.deleteMany({ expenseId: req.params.id });

  res.json({ message: "Gasto eliminado" });
};

