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

 const markAsPaid = async (id) => {
  await axios.patch(
    `${BASE_URL}/api/expenses/${id}`,
    { status: "paid" },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  fetchExpenses();
};

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

  const handleEdit = (expense) => {
  setForm({
    title: expense.title,
    notes: expense.notes || "",
    paidBy: expense.paidBy || "",
    products: expense.items.map((i) => ({
      productName: i.productName,
      price: i.price,
    })),
    debts: expense.debts || [],
  });

  setMode(expense.paidBy ? "personal" : "empresa");
};

const handleDelete = async (id) => {
  if (!confirm("¿Seguro que querés eliminar este gasto?")) return;

  await axios.delete(`${BASE_URL}/api/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  fetchExpenses();
};

const handlePay = async (expense) => {
  if (!expense.debts || expense.debts.length === 0) {
    alert("Este gasto no tiene deudas");
    return;
  }

  const debt = expense.debts[0]; // por ahora una sola deuda
  const amount = prompt("Monto a descontar:");

  if (!amount || Number(amount) <= 0) return;

await axios.patch(
  `${BASE_URL}/api/expenses/debt/${debt._id}/pay`,
  { amount },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

  fetchExpenses();
};


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
  <h3>{mode === "edit" ? "Editar gasto" : "Nuevo gasto"}</h3>

  <div className="field">
    <label>Concepto</label>
    <input
      value={form.title}
      onChange={(e) => setForm({ ...form, title: e.target.value })}
    />
  </div>

  <div className="field">
    <label>Notas</label>
    <textarea
      value={form.notes}
      onChange={(e) => setForm({ ...form, notes: e.target.value })}
    />
  </div>

  {mode === "personal" && (
    <div className="field">
      <label>Quién pagó</label>
      <select
        value={form.paidBy}
        onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
      >
        <option value="">Seleccionar</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.username}
          </option>
        ))}
      </select>
    </div>
  )}

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
        placeholder="$"
        value={p.price}
        onChange={(e) => {
          const products = [...form.products];
          products[i].price = e.target.value;
          setForm({ ...form, products });
        }}
      />
    </div>
  ))}

  <button className="add">+ Agregar producto</button>

  <div className="summary">
    <strong>Total:</strong> ${totalProducts}
  </div>

  <div className="actions">
    <button className="primary" onClick={submitExpense}>
  Guardar
</button>
    <button
  className="cancel"
  onClick={() => {
    setMode(null);
    setForm({
      title: "",
      paidBy: "",
      notes: "",
      products: [{ productName: "", price: "" }],
      debts: [],
    });
  }}
>
  Cancelar
</button>

  </div>

</div>
      )}

      <hr />

      {/* LISTADO */}
      <h3>Gastos</h3>
      {expenses.map((e) => (
  <div key={e._id} className="expense-card">
    <h4>{e.title}</h4>

    <p className="notes">{e.notes || "Sin descripción"}</p>

    <p>
      {e.paidBy ? `Pagó: ${e.paidBy}` : "Pagó la empresa"}
    </p>

    {/* PRODUCTOS */}
    <ul className="items">
      {e.items.map((it) => (
        <li key={it._id}>
          {it.productName} – ${it.price}
        </li>
      ))}
    </ul>

    <p className="total">Total: ${e.totalAmount}</p>

    <p>
      Estado:
      <span className={`status ${e.status}`}>
        {e.status}
      </span>
    </p>

    {/* BOTONES */}
   <div className="actions">
  <button onClick={() => handleEdit(e)}>✏️ Editar</button>
  <button onClick={() => handleDelete(e._id)}>🗑 Eliminar</button>

  {/* SI TIENE DEUDAS */}
  {e.debts?.length > 0 && e.status !== "paid" && (
    <button onClick={() => handlePay(e)}>
      ➖ Descontar pago
    </button>
  )}

  {/* SI NO ESTÁ PAGADO */}
  {e.status !== "paid" && (
    <button onClick={() => markAsPaid(e._id)}>
      ✅ Marcar como pagado
    </button>
  )}
</div>


  </div>
))}

    </div>
  );
}
