import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash } from "react-bootstrap-icons"; // importamos el icono
import CloseButton from "react-bootstrap/CloseButton";
import styles from "./Orders.module.css";

const statusFlow = ["Pendiente", "En progreso", "Completado"];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [user, setUser] = useState(null); // guardamos el usuario

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    alert("Debés iniciar sesión para ver tus pedidos.");
    navigate("/login");
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  if (parsedUser.role !== "admin" && parsedUser.role !== "superAdmin") {
    alert("No tenés permiso para ver esta sección.");
    navigate("/");
    return;
  }

  setUser(parsedUser); // sólo después de pasar validaciones

  const token = localStorage.getItem("token");

  fetch("http://localhost:3000/api/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar pedidos");
      return res.json();
    })
    .then((data) => setOrders(data))
    .catch((err) => console.error(err));
}, [navigate]);


  const changeStatus = async (orderId, newStatus) => {
    if (loadingIds.includes(orderId)) return;

    setLoadingIds((ids) => [...ids, orderId]);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        alert(
          "Error al actualizar estado: " + (errData.error || res.statusText)
        );
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      alert("Error de red al actualizar estado");
    } finally {
      setLoadingIds((ids) => ids.filter((id) => id !== orderId));
    }
  };

  // NUEVA FUNCION para eliminar pedido
  const handleDelete = async (orderId) => {
    if (loadingIds.includes(orderId)) return;

    if (!window.confirm("¿Querés eliminar este pedido? Esta acción no se puede deshacer.")) return;

    setLoadingIds((ids) => [...ids, orderId]);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Error al eliminar pedido: " + (errData.error || res.statusText));
        return;
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    } catch (error) {
      alert("Error de red al eliminar pedido");
    } finally {
      setLoadingIds((ids) => ids.filter((id) => id !== orderId));
    }
  };

  const getNextStatus = (currentStatus) => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx === -1 || idx === statusFlow.length - 1) return null;
    return statusFlow[idx + 1];
  };

  const getPrevStatus = (currentStatus) => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx <= 0) return null;
    return statusFlow[idx - 1];
  };

  const renderOrder = (order) => {
    const nextStatus = getNextStatus(order.status);
    const prevStatus = getPrevStatus(order.status);

    return (
      <div key={order.id} className={styles.orderCard}>
        <strong>Pedido #{order.id}</strong> - {order.name}

        <div className={styles.buttonsContainer}>
          {prevStatus && (
            <button
              disabled={loadingIds.includes(order.id)}
              onClick={() => changeStatus(order.id, prevStatus)}
              title={`Volver a ${prevStatus}`}
            >
              {prevStatus}
            </button>
          )}

          {nextStatus && (
            <button
              disabled={loadingIds.includes(order.id)}
              onClick={() => changeStatus(order.id, nextStatus)}
              title={`Avanzar a ${nextStatus}`}
            >
              {nextStatus}
            </button>
          )}

          {/* Mostrar botón de borrar solo si el pedido está completado y el usuario es superAdmin */}
          {order.status === "Completado" && user?.role === "superAdmin" && (
            <button
              className={styles.trashButton}
              onClick={() => handleDelete(order.id)}
              disabled={loadingIds.includes(order.id)}
              title="Eliminar pedido"
              style={{ marginLeft: "10px" }}
            >
              <Trash />
            </button>
          )}
        </div>
      </div>
    );
  };

  const pending = orders.filter((o) => o.status === "Pendiente");
  const inProgress = orders.filter((o) => o.status === "En progreso");
  const completed = orders.filter((o) => o.status === "Completado");

  return (
    <>
      <div className={styles.contactClose}>
        <CloseButton
          aria-label="Cerrar formulario"
          onClick={() => navigate("/")}
        />
      </div>
      <div className={styles.ordersContainer}>
        <h1>Pedidos de todos los usuarios</h1>

        <div className={styles.statusColumns}>
          <div className={styles.statusColumn}>
            <h2>Pendientes</h2>
            {pending.length === 0 ? <p>No hay pendientes.</p> : pending.map(renderOrder)}
          </div>

          <div className={styles.statusColumn}>
            <h2>En progreso</h2>
            {inProgress.length === 0 ? <p>No hay en progreso.</p> : inProgress.map(renderOrder)}
          </div>

          <div className={styles.statusColumn}>
            <h2>Completados</h2>
            {completed.length === 0 ? <p>No hay completados.</p> : completed.map(renderOrder)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;
