import { useEffect, useState } from "react";
import axios from "axios";
import "./expenses.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BsPlusCircleFill, 
  BsTrashFill, 
  BsPencilSquare, 
  BsChevronLeft, 
  BsBriefcaseFill, 
  BsPersonFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsCashCoin
} from "react-icons/bs";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [mode, setMode] = useState(null); // 'select', 'personal', 'empresa', null

  const [form, setForm] = useState({
    title: "",
    paidBy: "",
    notes: "",
    products: [{ productName: "", price: "" }],
    debts: [],
  });

  const users = [
    { _id: "ID_HERNAN", username: "Hernán" },
    { _id: "ID_RUDDI", username: "Ruddi" },
    { _id: "ID_NACHO", username: "Nacho" },
  ];

  /* ======================
     API CALLS
  ====================== */

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/expenses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpenses(res.data);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const submitExpense = async () => {
    if (!form.title) {
      Swal.fire("Falta información", "Por favor ingresá un concepto", "warning");
      return;
    }

    if (mode === "personal" && !form.paidBy) {
      Swal.fire("Falta información", "Tenés que elegir quién pagó", "warning");
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

      Swal.fire({
        icon: "success",
        title: "Gasto guardado",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error al crear gasto:", err);
      Swal.fire("Error", "No se pudo guardar el gasto", "error");
    }
  };

  const markAsPaid = async (id) => {
    try {
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
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar este gasto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      await axios.delete(`${BASE_URL}/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchExpenses();
    }
  };

  const handlePay = async (expense) => {
    const debt = expense.debts?.[0];
    if (!debt) return;

    const { value: amount } = await Swal.fire({
      title: "Registrar Pago",
      input: "number",
      inputLabel: `Monto a descontar (Máx $${debt.remainingAmount})`,
      inputPlaceholder: "Monto...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) return "Ingresá un monto válido";
        if (Number(value) > debt.remainingAmount) return "No podés pagar más de la deuda";
      }
    });

    if (amount) {
      try {
        await axios.patch(
          `${BASE_URL}/api/expenses/debt/${debt._id}/pay`,
          { amount: Number(amount) },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        fetchExpenses();
      } catch (err) {
        Swal.fire("Error", "Error al registrar el pago", "error");
      }
    }
  };

  /* ======================
     HELPERS
  ====================== */

  const resetForm = () => {
    setMode(null);
    setForm({
      title: "",
      paidBy: "",
      notes: "",
      products: [{ productName: "", price: "" }],
      debts: [],
    });
  };

  const totalProducts = form.products.reduce(
    (acc, p) => acc + Number(p.price || 0),
    0
  );

  const addProductRow = () => {
    setForm({
      ...form,
      products: [...form.products, { productName: "", price: "" }],
    });
  };

  const removeProductRow = (index) => {
    const products = form.products.filter((_, i) => i !== index);
    setForm({ ...form, products });
  };

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="expenses-page">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Gestión de Gastos
      </motion.h2>

      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.button 
            key="new-btn"
            className="new-note" 
            onClick={() => setMode("select")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BsPlusCircleFill style={{ marginRight: 8 }} /> Nueva nota
          </motion.button>
        ) : mode === "select" ? (
          <motion.div 
            key="selector"
            className="mode-selector"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button onClick={() => setMode("personal")}>
              <BsPersonFill size={32} color="#6366f1" />
              <b>💸 Gasto Personal</b>
              <span>Alguien puso su propia plata y la empresa le debe.</span>
            </button>

            <button onClick={() => setMode("empresa")}>
              <BsBriefcaseFill size={32} color="#db2777" />
              <b>🏢 Gasto Empresa</b>
              <span>El gasto fue abonado directamente por RubioHermanos.</span>
            </button>
            <button className="close-form" onClick={() => setMode(null)}>
              <BsChevronLeft size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="expense-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button className="close-form" onClick={resetForm}>
              <BsChevronLeft size={20} />
            </button>

            <h3>{mode === "personal" ? "Nuevo Gasto Personal" : "Nuevo Gasto Empresa"}</h3>

            <div className="field">
              <label>Concepto del Gasto</label>
              <input
                placeholder="Ej: Compra de insumos, Limpieza, etc"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Notas adicionales</label>
              <textarea
                placeholder="Detalles del gasto..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {mode === "personal" && (
              <div className="field">
                <label>¿Quién realizó el pago?</label>
                <select
                  value={form.paidBy}
                  onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                >
                  <option value="">Seleccionar responsable</option>
                  {users.map((u) => (
                    <option key={u._id} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-products-header">
              <h4>Desglose de Productos</h4>
            </div>

            {form.products.map((p, i) => (
              <div key={i} className="product-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <input
                    placeholder="Producto/Servicio"
                    value={p.productName}
                    onChange={(e) => {
                      const products = [...form.products];
                      products[i].productName = e.target.value;
                      setForm({ ...form, products });
                    }}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={p.price}
                    onChange={(e) => {
                      const products = [...form.products];
                      products[i].price = e.target.value;
                      setForm({ ...form, products });
                    }}
                  />
                </div>
                {form.products.length > 1 && (
                  <button className="remove-item" onClick={() => removeProductRow(i)}>
                    <BsTrashFill />
                  </button>
                )}
              </div>
            ))}

            <button className="add-product-btn" onClick={addProductRow}>
              + Agregar otro ítem
            </button>

            <div className="form-footer">
              <div className="total-preview">
                Total: <span>${totalProducts.toLocaleString()}</span>
              </div>
              <div className="actions">
                <button className="primary" onClick={submitExpense}>Guardar Gasto</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <hr style={{ margin: "3rem 0", opacity: 0.1 }} />

      <h3>Historial de Gastos</h3>
      
      <div className="expenses-grid">
        {expenses.map((e) => {
          const debt = e.debts?.[0];
          const progress = debt ? ((e.totalAmount - debt.remainingAmount) / e.totalAmount) * 100 : 100;

          return (
            <motion.div 
              key={e._id} 
              className="expense-card"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="card-header">
                <h4>{e.title}</h4>
                <span className={`type-badge ${e.paidBy ? 'type-personal' : 'type-company'}`}>
                  {e.paidBy ? 'Personal' : 'Empresa'}
                </span>
              </div>

              <p className="notes">{e.notes || "Sin descripción adicional"}</p>

              <ul className="items-list">
                {e.items?.length > 0 ? (
                  e.items.map((it) => (
                    <li key={it._id}>
                      <span>{it.productName}</span>
                      <b>${it.price.toLocaleString()}</b>
                    </li>
                  ))
                ) : (
                  <li><span>Total directo</span> <b>${e.totalAmount}</b></li>
                )}
              </ul>

              <div className="card-footer">
                <div className="amount-group">
                  <div>
                    <div className="amount-label">Monto Total</div>
                    <div className="main-amount">${e.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className={`status-pill status-${e.status}`}>
                      {e.status === 'paid' && <BsCheckCircleFill size={14} />}
                      {e.status === 'pending' && <BsXCircleFill size={14} />}
                      {e.status === 'partial' && <BsCashCoin size={14} />}
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </span>
                  </div>
                </div>

                {debt && debt.remainingAmount > 0 && (
                  <div className="debt-progress-container">
                    <div className="progress-header">
                      <span>Restante: ${debt.remainingAmount.toLocaleString()}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="card-actions">
                  <button className="btn-icon" onClick={() => handleDelete(e._id)}>
                    <BsTrashFill /> Eliminar
                  </button>
                  
                  {e.paidBy && debt?.remainingAmount > 0 && (
                    <button className="btn-icon btn-pay" onClick={() => handlePay(e)}>
                      <BsCashCoin /> Descontar Pago
                    </button>
                  )}

                  {!e.paidBy && e.status !== "paid" && (
                    <button className="btn-icon btn-pay" onClick={() => markAsPaid(e._id)}>
                      <BsCheckCircleFill /> Marcar Pagado
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
