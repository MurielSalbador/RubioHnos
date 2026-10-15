// controllers/expense.controller.js
import Expense from "../mongoModels/Expense.mongo.js";
import ExpenseDebt from "../mongoModels/ExpenseDebt.mongo.js";
import ExpenseItem from "../mongoModels/ExpenseItem.mongo.js";

/* =========================
   CREATE
========================= */
export const createExpense = async (req, res) => {
  try {
    const { title, paidBy, notes, products = [], debts = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Falta el concepto" });
    }

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

  const status = "pending";

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

    if (paidBy) {
  await ExpenseDebt.create({
    expenseId: expense._id,
    totalAmount,
    remainingAmount: totalAmount,
    status: "pending",
  });
}


    res.status(201).json(expense);
  } catch (err) {
    console.error("🔥 createExpense error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET ALL
========================= */
export const getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 }).lean();
  const ids = expenses.map((e) => e._id);

  // 2 consultas en total (antes eran 2 por cada gasto y se volvía lento)
  const [debts, items] = await Promise.all([
    ExpenseDebt.find({ expenseId: { $in: ids } }).lean(),
    ExpenseItem.find({ expenseId: { $in: ids } }).lean(),
  ]);

  const group = (list) =>
    list.reduce((acc, doc) => {
      const key = String(doc.expenseId);
      (acc[key] ||= []).push(doc);
      return acc;
    }, {});
  const debtsBy = group(debts);
  const itemsBy = group(items);

  res.json(
    expenses.map((exp) => ({
      ...exp,
      debts: debtsBy[String(exp._id)] || [],
      items: itemsBy[String(exp._id)] || [],
    }))
  );
};

/* =========================
   UPDATE STATUS
========================= */
export const updateExpenseStatus = async (req, res) => {
  const { status } = req.body;

  if (!["pending", "partial", "paid"].includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(expense);
};

/* =========================
   PAY DEBT
========================= */
export const payDebt = async (req, res) => {
  const { amount } = req.body;

  if (Number(amount) <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }

  const debt = await ExpenseDebt.findById(req.params.id);

  if (!debt) {
    return res.status(404).json({ error: "Deuda no encontrada" });
  }

  if (Math.round(Number(amount) * 100) > Math.round(debt.remainingAmount * 100)) {
    return res.status(400).json({
      error: "No podés pagar más de lo que falta",
    });
  }

  // Redondeamos a centavos: con decimales podía quedar 0.0000001 "pendiente"
  debt.remainingAmount = Math.round((debt.remainingAmount - Number(amount)) * 100) / 100;

  if (debt.remainingAmount <= 0) {
    debt.remainingAmount = 0;
    debt.status = "paid";
    await Expense.findByIdAndUpdate(debt.expenseId, { status: "paid" });
  } else {
    debt.status = "partial";
    await Expense.findByIdAndUpdate(debt.expenseId, { status: "partial" });
  }

  await debt.save();

  res.json(debt);
};



/* =========================
   RECALC STATUS
========================= */
export const recalcExpenseStatus = async (expenseId) => {
  const debts = await ExpenseDebt.find({ expenseId });

  // 🔴 SI NO HAY DEUDAS → PENDING
  if (debts.length === 0) {
    await Expense.findByIdAndUpdate(expenseId, { status: "pending" });
    return;
  }

  const allPaid = debts.every(d => d.status === "paid");
  const somePaid = debts.some(d => d.amountPaid > 0);

  let status = "pending";
  if (allPaid) status = "paid";
  else if (somePaid) status = "partial";

  await Expense.findByIdAndUpdate(expenseId, { status });
};

/* =========================
   DELETE
========================= */
export const deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  await ExpenseDebt.deleteMany({ expenseId: req.params.id });
  await ExpenseItem.deleteMany({ expenseId: req.params.id });

  res.json({ message: "Gasto eliminado" });
};