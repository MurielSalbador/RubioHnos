import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaChevronDown, FaMapMarkerAlt, FaRedo } from "react-icons/fa";
import { formatPrice } from "../../cart/Cart/useProductCartState.js";
import styles from "./MyOrders.module.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

const STATUS = {
  Pendiente: { label: "Pendiente", icon: "⏳", cls: "pending" },
  "En progreso": { label: "En camino", icon: "🚚", cls: "progress" },
  Completado: { label: "Entregado", icon: "✅", cls: "done" },
};

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d)) return value || "";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

// Antes los pedidos se leían solo del navegador: no aparecían en otro
// celular y se guardaban aunque el pedido se cancelara. Ahora vienen del servidor.
async function fetchMyOrders(email) {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`${API_URL}/api/orders/user/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

const MyOrders = () => {
  const user = getUser();
  const email = user?.email;

  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["my-orders", email],
    queryFn: () => fetchMyOrders(email),
    enabled: Boolean(email),
  });

  if (!user) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔐</div>
          <h1>Iniciá sesión para ver tus pedidos</h1>
          <p>Así podés seguir el estado de cada compra.</p>
          <Link to="/login" className="btn-leaf" onClick={() => localStorage.setItem("redirectAfterLogin", "/myOrders")}>
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`page-shell ${styles.page}`}>
      <div className={styles.container}>
        <Link to="/shop" className={styles.back}><FaArrowLeft /> Volver a la tienda</Link>
        <h1 className={styles.title}>Mis pedidos</h1>

        {isLoading ? (
          <div className={styles.list}>
            {[0, 1, 2].map((i) => <div key={i} className={`${styles.card} ${styles.skeleton}`} />)}
          </div>
        ) : isError ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📡</div>
            <h2>No pudimos cargar tus pedidos</h2>
            <button className="btn-brand" onClick={() => refetch()}><FaRedo /> Reintentar</button>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🧾</div>
            <h2>Todavía no hiciste pedidos</h2>
            <p>Cuando compres algo, lo vas a ver acá con su estado.</p>
            <Link to="/shop" className="btn-leaf">Ir a la tienda</Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {orders.map((order, index) => {
              const status = STATUS[order.status] || STATUS.Pendiente;
              const items = Array.isArray(order.items) ? order.items : [];
              const count = items.reduce((t, i) => t + (Number(i.quantity) || 0), 0);
              return (
                <li key={order._id || index} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.date}>{formatDate(order.date)}</span>
                      <strong className={styles.orderTotal}>{formatPrice(Number(order.total))}</strong>
                    </div>
                    <span className={`${styles.status} ${styles[status.cls]}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className={styles.track} data-step={status.cls}>
                    <span /><span /><span />
                  </div>

                  <p className={styles.address}>
                    <FaMapMarkerAlt /> {order.address}, {order.city}
                  </p>

                  <details className={styles.details}>
                    <summary>
                      {count === 1 ? "1 producto" : `${count} productos`} <FaChevronDown />
                    </summary>
                    <ul>
                      {items.map((item, i) => (
                        <li key={i}>
                          <span>{item.title || "Producto"} <small>x{item.quantity}</small></span>
                          {item.price != null && <span>{formatPrice(item.price * item.quantity)}</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
