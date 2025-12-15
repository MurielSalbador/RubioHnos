//para ver pedidos (solo admin y superadmin)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseButton from "react-bootstrap/CloseButton";
import styles from "./AllOrders.module.css";
import axios from "axios";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !token) {
      alert("Debés iniciar sesión como administrador.");
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Error al obtener pedidos:", err);
        alert("No estás autorizado para ver esta sección.");
        navigate("/");
      });
  }, [navigate]);

  return (
  <>
    <div className={styles.contactClose}>
      <CloseButton
        aria-label="Cerrar pedidos"
        onClick={() => navigate("/")}
      />
    </div>

    <main className={`${styles.myOrders} ${styles.adminOrders}`}>
      <div className={styles.container}>
        <h1>📋 Comandas – Todos los pedidos</h1>

        {orders.length === 0 ? (
          <p>No hay pedidos aún.</p>
        ) : (
          <ul className={styles.ordersList}>
            {orders.map((order, index) => (
              <li key={order._id || index} className={styles.orderItem}>
                
                <h3>🛒 Pedido #{index + 1}</h3>

                <p>
                  <strong>📧 Email:</strong> {order.email}
                </p>

                <p>
                  <strong>📍 Dirección:</strong><br />
                  {order.address} – {order.city}
                </p>

                <p>
                  <strong>💰 Total:</strong> ${order.total}
                </p>

                <details>
                  <summary>📦 Ver productos</summary>
                  <ul>
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.title} × {item.quantity}
                        <span>
                          {" "}– ${item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>

              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  </>
);
};

export default AllOrders;
