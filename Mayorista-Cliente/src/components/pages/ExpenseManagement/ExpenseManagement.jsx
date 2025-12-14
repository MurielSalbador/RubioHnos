import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    console.log("BASE_URL:", BASE_URL);
  axios
    .get(`${BASE_URL}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then(res => {
      console.log("RESPUESTA EXPENSES:", res.data);
      setExpenses(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => {
      console.error("Error expenses", err);
      setExpenses([]);
    });
}, []);

  return (
    <div className="expenses-page">
      <h2>Gestión de Gastos</h2>

      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Pagó</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map(e => (
            <tr key={e._id}>
              <td>{e.title}</td>
              <td>{e.paidBy?.username}</td>
              <td>${e.totalAmount}</td>
              <td>{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
