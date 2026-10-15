import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { FaArrowLeft, FaWhatsapp, FaMapMarkerAlt, FaUser, FaLock } from "react-icons/fa";
import ModalPurchase from "../../../modal/ModalPurchase.jsx";
import { useCart } from "../../../../store.js";
import { getImageUrl } from "../../../../utils/image.js";
import { formatPrice } from "../Cart/useProductCartState.js";
import styles from "./FinishCart.module.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

const CONTACTS = [
  { name: "Hernan", phone: "5493416863976" },
  { name: "Ruddi", phone: "5493416946454" },
  { name: "Nacho", phone: "5493413916661" },
];

// Costos de envío por ciudad (el servidor usa la misma tabla)
const SHIPPING_COSTS = {
  Rosario: 2500,
  Alvarez: 1000,
  Piñero: 0,
  Soldini: 2500,
  "Pueblo Muñoz": 2500,
};

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function buildWhatsappMessage({ user, order, fallbackItems, shippingCost }) {
  const items = order?.items?.length ? order.items : fallbackItems;
  const lines = items
    .map((item) => `• ${item.title} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  return `🛒 Nuevo pedido de ${user?.username || order?.name || "cliente"} (${user?.email || "sin email"})

👤 Nombre: ${order?.name}
🏙️ Localidad: ${order?.city}
📍 Dirección: ${order?.address}

📦 Productos:
${lines}

🚚 Envío: ${formatPrice(Number(order?.shippingCost ?? shippingCost))}
💰 Total: ${formatPrice(Number(order?.total))}

¡Gracias! 🙌`;
}

const FinishCart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useCart((s) => s.cart);
  const clearCart = useCart((s) => s.clearCart);
  const user = getUser();

  const [formData, setFormData] = useState(() => {
    // Recuperar datos si tuvo que iniciar sesión en el medio
    const saved = localStorage.getItem("pendingCheckoutData");
    if (saved) {
      localStorage.removeItem("pendingCheckoutData");
      try {
        return { name: "", city: "", address: "", contact: "", ...JSON.parse(saved) };
      } catch {
        /* datos corruptos: empezamos de cero */
      }
    }
    return { name: user?.username || "", city: "", address: "", contact: "" };
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = SHIPPING_COSTS[formData.city] ?? 0;
  const finalTotal = subtotal + shippingCost;
  const itemsCount = cart.reduce((t, i) => t + i.quantity, 0);

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (formData.name.trim().length < 3) e.name = "Escribí tu nombre (mínimo 3 letras).";
    if (!formData.city) e.city = "Elegí tu localidad.";
    if (formData.address.trim().length < 5) e.address = "Escribí la dirección de entrega.";
    if (!formData.contact) e.contact = "Elegí con quién querés hablar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending || cart.length === 0) return;
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      const result = await Swal.fire({
        title: "Iniciá sesión para continuar",
        text: "Para registrar tu pedido necesitamos que entres a tu cuenta. Tus datos quedan guardados.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Iniciar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2f7d4f",
      });
      if (result.isConfirmed) {
        localStorage.setItem("pendingCheckoutData", JSON.stringify(formData));
        localStorage.setItem("redirectAfterLogin", "/finish");
        navigate("/login");
      }
      return;
    }

    const contact = CONTACTS.find((c) => c.phone === formData.contact);

    // Abrimos la pestaña YA (en el clic). Si la abrimos después de esperar
    // al servidor, Safari/iPhone la bloquea como "ventana emergente".
    const waWindow = window.open("", "_blank");

    setSending(true);
    try {
      const newOrder = {
        name: formData.name.trim(),
        city: formData.city,
        address: formData.address.trim(),
        // El servidor toma precios y nombres de la base; esto es de respaldo
        items: cart.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
          title: item.title,
          price: item.price,
        })),
        total: finalTotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        date: new Date().toLocaleString(),
      };

      const { data } = await axios.post(`${API_URL}/api/orders`, newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = data?.order || newOrder;

      const message = buildWhatsappMessage({ user, order, fallbackItems: newOrder.items, shippingCost });
      const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;

      if (waWindow) waWindow.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;

      // Copia local para "Mis pedidos" si no hay conexión
      const key = `orders_${user?.email || ""}`;
      try {
        const previous = JSON.parse(localStorage.getItem(key)) || [];
        localStorage.setItem(key, JSON.stringify([...previous, order]));
      } catch {
        /* sin espacio en el navegador: no pasa nada */
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      clearCart();
      setShowModal(true);
    } catch (err) {
      waWindow?.close();
      console.error("Error al guardar pedido:", err);
      Swal.fire({
        title: "No pudimos registrar el pedido",
        text: err.response?.data?.error || "Revisá tu conexión e intentá de nuevo.",
        icon: "error",
        confirmButtonColor: "#5a3412",
      });
    } finally {
      setSending(false);
    }
  };

  if (cart.length === 0 && !showModal) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🧺</div>
          <h1>No hay nada para finalizar</h1>
          <p>Tu carrito está vacío. ¡Sumá algo rico y volvé!</p>
          <Link to="/shop" className="btn-leaf">Ir a la tienda</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.wrap}>
          <Link to="/cart" className={styles.back}>
            <FaArrowLeft /> Volver al carrito
          </Link>
          <h1 className={styles.title}>Finalizar compra</h1>
          <ol className={styles.steps}>
            <li className={styles.done}>Carrito</li>
            <li className={styles.current}>Datos de entrega</li>
            <li>WhatsApp</li>
          </ol>

          <form className={styles.grid} onSubmit={handleSubmit} noValidate>
            <div className={styles.formCol}>
              <section className={styles.card}>
                <h2><FaUser /> Tus datos</h2>
                <label className={styles.field}>
                  <span>Nombre y apellido</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Juan Pérez"
                    autoComplete="name"
                    className={errors.name ? styles.invalid : ""}
                  />
                  {errors.name && <small className={styles.error}>{errors.name}</small>}
                </label>
              </section>

              <section className={styles.card}>
                <h2><FaMapMarkerAlt /> ¿Dónde lo entregamos?</h2>
                <div className={styles.cities} role="radiogroup" aria-label="Localidad">
                  {Object.entries(SHIPPING_COSTS).map(([city, cost]) => (
                    <button
                      type="button"
                      key={city}
                      role="radio"
                      aria-checked={formData.city === city}
                      className={`${styles.city} ${formData.city === city ? styles.selected : ""}`}
                      onClick={() => update("city", city)}
                    >
                      <strong>{city}</strong>
                      <small className={cost === 0 ? styles.free : ""}>
                        {cost === 0 ? "Envío gratis" : `Envío ${formatPrice(cost)}`}
                      </small>
                    </button>
                  ))}
                </div>
                {errors.city && <small className={styles.error}>{errors.city}</small>}

                <label className={styles.field}>
                  <span>Dirección</span>
                  <textarea
                    value={formData.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Calle 123, piso 1, depto A (y alguna referencia)"
                    autoComplete="street-address"
                    rows={2}
                    className={errors.address ? styles.invalid : ""}
                  />
                  {errors.address && <small className={styles.error}>{errors.address}</small>}
                </label>
              </section>

              <section className={styles.card}>
                <h2><FaWhatsapp /> ¿Con quién hablás?</h2>
                <p className={styles.hint}>Le mandamos tu pedido por WhatsApp para coordinar el pago y la entrega.</p>
                <div className={styles.contacts}>
                  {CONTACTS.map((c) => (
                    <button
                      type="button"
                      key={c.phone}
                      className={`${styles.contact} ${formData.contact === c.phone ? styles.selected : ""}`}
                      onClick={() => update("contact", c.phone)}
                      aria-pressed={formData.contact === c.phone}
                    >
                      <span className={styles.avatar}>{c.name[0]}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
                {errors.contact && <small className={styles.error}>{errors.contact}</small>}
              </section>
            </div>

            <aside className={styles.summary}>
              <h2>Tu pedido</h2>
              <ul className={styles.items}>
                {cart.map((item) => (
                  <li key={item._id}>
                    <img src={getImageUrl(item.imageUrl, 120)} alt="" loading="lazy" />
                    <span className={styles.itemName}>
                      {item.title}
                      <small>x{item.quantity}</small>
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.row}><span>Productos ({itemsCount})</span><span>{formatPrice(subtotal)}</span></div>
              <div className={styles.row}>
                <span>Envío</span>
                <span>{!formData.city ? "—" : shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
              </div>
              <div className={styles.total}><span>Total</span><span>{formatPrice(finalTotal)}</span></div>

              <button type="submit" className={`btn-leaf ${styles.submit}`} disabled={sending}>
                <FaWhatsapp /> {sending ? "Enviando…" : "Enviar pedido por WhatsApp"}
              </button>
              <p className={styles.secure}><FaLock /> El pago se coordina con el vendedor</p>
            </aside>
          </form>
        </div>
      </main>

      <ModalPurchase
        show={showModal}
        onHide={() => {
          setShowModal(false);
          navigate("/");
        }}
      />
    </>
  );
};

export default FinishCart;
