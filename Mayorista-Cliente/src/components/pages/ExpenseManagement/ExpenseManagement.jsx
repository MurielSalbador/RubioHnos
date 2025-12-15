import { useEffect, useState } from "react";
import axios from "axios";
import "./expenses.css";

const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [mode, setMode] = useState(null);

  const [form, setForm] = useState({
    title: "",
    paidBy: "",
    notes: "",
    products: [{ productName: "", price: "" }], // 👈 string
    debts: [],
  });

  const users = [
    { _id: "ID_HERNAN", username: "Hernán" },
    { _id: "ID_RUDDI", username: "Ruddi" },
    { _id: "ID_NACHO", username: "Nacho" },
  ];

  /* ======================
     CALCULOS
  ====================== */

  const totalProducts = form.products.reduce(
    (acc, p) => acc + Number(p.price || 0),
    0
  );

  /* ======================
     API
  ====================== */

  const fetchExpenses = async () => {
    const res = await axios.get(`${BASE_URL}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const submitExpense = async () => {
    if (!form.title) {
      alert("Falta el concepto");
      return;
    }

    if (mode === "personal" && !form.paidBy) {
      alert("Tenés que elegir quién pagó");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/expenses`,
        {
          ...form,
          paidBy: mode === "empresa" ? null : form.paidBy,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setForm({
        title: "",
        paidBy: "",
        notes: "",
        products: [{ productName: "", price: "" }],
        debts: [],
      });

      setMode(null);
      fetchExpenses();
    } catch (err) {
      console.error("Error al crear gasto:", err);
      alert("Error al guardar el gasto");
    }
  };

  /* ======================
     UI
  ====================== */

  return (
    <div className="expenses-page">
      <h2>Gestión de Gastos</h2>

      {/* BOTÓN NUEVA NOTA */}
      {!mode && (
        <button className="new-note" onClick={() => setMode("select")}>
          ➕ Nueva nota
        </button>
      )}

      {/* SELECCIÓN DE TIPO */}
      {mode === "select" && (
        <div className="mode-selector">
          <button onClick={() => setMode("personal")}>
            💸 Gasto personal
            <span>Alguien puso su plata</span>
          </button>

          <button onClick={() => setMode("empresa")}>
            🏢 Gasto de la empresa
            <span>RubioHermanos pagó</span>
          </button>
        </div>
      )}

      {/* FORMULARIO */}
      {(mode === "personal" || mode === "empresa") && (
        <div className="expense-form">
          <h3>
            {mode === "personal" ? "Gasto personal" : "Gasto de la empresa"}
          </h3>

          <input
            placeholder="Concepto"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {mode === "personal" && (
            <select
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
            >
              <option value="">Quién pagó</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username}
                </option>
              ))}
            </select>
          )}

          {/* PRODUCTOS */}
          <h4>Productos</h4>
          {form.products.map((p, i) => (
            <div key={i} className="row">
              <input
                placeholder="Producto"
                value={p.productName}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i].productName = e.target.value;
                  setForm({ ...form, products });
                }}
              />
              <input
                type="number"
                placeholder="Precio"
                value={p.price}
                onChange={(e) => {
                  const products = [...form.products];
                  products[i].price = e.target.value; // 👈 string
                  setForm({ ...form, products });
                }}
              />
            </div>
          ))}

          <button
            onClick={() =>
              setForm({
                ...form,
                products: [...form.products, { productName: "", price: "" }],
              })
            }
          >
            + Producto
          </button>

          {/* TOTAL */}
          <h4>Total a reponer</h4>
          <p className="total">${totalProducts}</p>

          <button className="primary" onClick={submitExpense}>
            Guardar gasto
          </button>

          <button className="cancel" onClick={() => setMode(null)}>
            Cancelar
          </button>
        </div>
      )}

      <hr />

      {/* LISTADO */}
      <h3>Gastos</h3>
      {expenses.map((e) => (
        <div key={e._id} className="expense-card">
          <h4>{e.title}</h4>
          <p>{e.paidBy ? `Pagó: ${e.paidBy}` : "Pagó la empresa"}</p>
          <p>Total: ${e.totalAmount}</p>
          <p>
            Estado: <span className={`status ${e.status}`}>{e.status}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
