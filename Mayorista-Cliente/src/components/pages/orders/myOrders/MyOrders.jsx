import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseButton from "react-bootstrap/CloseButton";
import styles from "./MyOrders.module.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Debés iniciar sesión para ver tu historial de compras.");
      navigate("/login");
      return;
    }

    const userEmail = user.email;
    const ordersKey = `orders_${userEmail}`;
    const savedOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    setOrders(savedOrders);
  }, [navigate]);

  return (
    <>
   
    <main className={styles.myOrders}>
       <div className={styles.contactClose}>
              <CloseButton
                aria-label="Cerrar formulario"
                onClick={() => navigate("/")}
              />
            </div>
      <div className={styles.container}>
        <h1>Mis Compras</h1>

        {orders.length === 0 ? (
          <p>No tenés compras registradas aún.</p>
        ) : (
          <ul className={styles.ordersList}>
            {orders.map((order, index) => (
              <li key={index} className={styles.orderItem}>
                <h3>🛒 Pedido #{index + 1}</h3>
                <p><strong>Fecha:</strong> {order.date}</p>
                <p><strong>Nombre:</strong> {order.name}</p>
                <p><strong>Localidad:</strong> {order.city}</p>
                <p><strong>Dirección:</strong> {order.address}</p>
                <p><strong>Total:</strong> ${order.total}</p>
                <details>
                  <summary>Ver productos</summary>
                  <ul>
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.title} x{item.quantity} - ${item.price * item.quantity}
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

export default MyOrders;
