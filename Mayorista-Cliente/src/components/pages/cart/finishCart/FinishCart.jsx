import { useState, useEffect } from "react";
import { useCart } from "../../../../store.js";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import axios from "axios";
import ModalPurchase from "../../../modal/ModalPurchase.jsx";
import CloseButton from "react-bootstrap/CloseButton";
import styles from "./FinishCart.module.css";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

const FinishCart = () => {
  const contacts = [
    {
      name: "Hernan",
      phone: "5493416863976",
      image: "https://ui-avatars.com/api/?name=Hernan",
    },
    {
      name: "Ruddi",
      phone: "5493416946454",
      image: "https://ui-avatars.com/api/?name=Ruddi",
    },
    {
      name: "Nacho",
      phone: "5493413916661",
      image: "https://ui-avatars.com/api/?name=Nacho",
    },
  ];

  // Costos de envío por ciudad
  const shippingCosts = {
    Rosario: 2500,
    Alvarez: 1000,
    Piñero: 0,
    Soldini: 2500,
    "Pueblo Muñoz": 2500,
  };

  const { cart, clearCart, setCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Usuario
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userEmail = user?.email || "";

  const userOrdersKey = `orders_${userEmail}`;

  // Total del carrito
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Total final con envío incluido
  const finalTotal = total + shippingCost;

  // React Query
  const queryClient = useQueryClient();

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si cambia la ciudad, actualizamos el costo de envío
    if (name === "city") {
      const cost = shippingCosts[value] || 0;
      setShippingCost(cost);
    }
  };

  const handleContactClick = (contact) => {
    const { name, city, address } = formData;

    if (
      name.trim().length < 3 ||
      city.trim().length < 2 ||
      address.trim().length < 5
    ) {
      Swal.fire(
        "Error",
        "Por favor completá todos los campos correctamente antes de elegir el contacto.",
        "error"
      );
      return;
    }

    setSelectedContact(contact);
  };

  // Agregar producto al carrito validando stock
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      if (existingProduct.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        Swal.fire(
          "Error",
          "Has alcanzado el límite de stock disponible para este producto.",
          "error"
        );
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        Swal.fire("Error", "Este producto no tiene stock disponible.", "error");
      }
    }
  };

  // Mostrar modal al volver de WhatsApp
  useEffect(() => {
    const showFlag = localStorage.getItem("showPurchaseModal") === "true";
    if (showFlag && cart.length > 0) {
      setShowModal(true);
    }
    localStorage.removeItem("showPurchaseModal");
  }, [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, city, address } = formData;

    if (cart.length === 0) {
      Swal.fire("Error", "Tu carrito está vacío...", "error");
      return;
    }

    if (name.trim().length < 3) {
      Swal.fire(
        "Error",
        "El nombre debe tener al menos 3 caracteres.",
        "error"
      );
      return;
    }
    if (city.trim().length < 2) {
      Swal.fire(
        "Error",
        "La localidad debe tener al menos 2 caracteres.",
        "error"
      );
      return;
    }
    if (address.trim().length < 5) {
      Swal.fire(
        "Error",
        "La dirección debe tener al menos 5 caracteres.",
        "error"
      );
      return;
    }
    if (!selectedContact) {
      Swal.fire(
        "Error",
        "Por favor seleccioná un contacto antes de confirmar la compra.",
        "error"
      );
      return;
    }

    const newOrder = {
      name,
      city,
      address,
      items: cart.map((item) => ({ _id: item._id, quantity: item.quantity })),
      total: finalTotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      date: new Date().toLocaleString(),
    };

    const previousOrders =
      JSON.parse(localStorage.getItem(userOrdersKey)) || [];
    localStorage.setItem(
      userOrdersKey,
      JSON.stringify([...previousOrders, newOrder])
    );

    const token = localStorage.getItem("token");

    Swal.fire({
      title: "¿Confirmar compra?",
      text: "Vas a enviar tu pedido por WhatsApp",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${API_URL}/api/orders`, newOrder, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          queryClient.invalidateQueries(["products"]);

          const message = `🛒 Nuevo Pedido Realizado por ${
            user.name || "usuario"
          } (${user.email || "email no disponible"}):

          👤 Nombre: ${name}
          🏙️ Localidad: ${city}
          📍 Dirección: ${address}
          🕒 Fecha: ${newOrder.date}

          📦 Productos:
          ${cart
            .map(
              (item) =>
                `• ${item.title} x${item.quantity} - $${(
                  item.price * item.quantity
                ).toFixed(2)}`
            )
            .join("\n")}

          🚚 Costo de envío: $${shippingCost.toFixed(2)}
          💰 Total final: $${finalTotal.toFixed(2)}

          ¡Gracias por tu compra! 🙌`;

          const whatsappUrl = /Android|iPhone/i.test(navigator.userAgent)
            ? `whatsapp://send?phone=${
                selectedContact.phone
              }&text=${encodeURIComponent(message)}`
            : `https://api.whatsapp.com/send?phone=${
                selectedContact.phone
              }&text=${encodeURIComponent(message)}`;

          localStorage.setItem("showPurchaseModal", "true");

          clearCart();
          setShowModal(true);
          window.open(whatsappUrl, "_blank");

          Swal.fire(
            "¡Pedido confirmado!",
            "Tu compra fue registrada ✅",
            "success"
          );
        } catch (err) {
          console.error("Error al guardar pedido:", err);
          Swal.fire(
            "Error",
            "Hubo un error al guardar el pedido. Intentalo de nuevo.",
            "error"
          );
        }
      }
    });
  };

  return (
    <>
      <main className={styles.finishCart}>
        <div className={styles.container} data-aos="fade-up">
          <div className={styles.contactClose}>
            <CloseButton
              aria-label="Cerrar formulario"
              onClick={() => navigate("/")}
            />
          </div>

          <div className={styles.header}>
            <h1>Checkout</h1>
            <p className={styles.subtitle}>Completá tus datos para finalizar el pedido</p>
          </div>

          <form className={styles.checkoutForm} onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div className={styles.formSection}>
              <label htmlFor="city">Localidad</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Seleccioná una localidad</option>
                <option value="Rosario">Rosario</option>
                <option value="Alvarez">Alvarez</option>
                <option value="Piñero">Piñero</option>
                <option value="Soldini">Soldini</option>
                <option value="Pueblo Muñoz">Pueblo Muñoz</option>
              </select>

              {formData.city && (
                <div className={styles.shippingBadge}>
                  {shippingCost === 0
                    ? "✨ ¡Envío gratis para esta localidad!"
                    : `🚚 Costo de envío: $${shippingCost}`}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <label htmlFor="address">Dirección de envío</label>
              <textarea
                id="address"
                name="address"
                placeholder="Calle 123, Piso 1, Depto A"
                value={formData.address}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>

            <p className={styles.contactOptionsTitle}>Seleccioná un vendedor</p>
            <div className={styles.contactOptions}>
              {contacts.map((contact) => (
                <button
                  key={contact.phone}
                  type="button"
                  onClick={() => handleContactClick(contact)}
                  className={`${styles.contactButton} ${
                    selectedContact?.phone === contact.phone
                      ? styles.contactButtonSelected
                      : ""
                  }`}
                >
                  <img
                    src={contact.image}
                    alt={contact.name}
                    className={styles.contactImage}
                  />
                  <span>{contact.name}</span>
                </button>
              ))}
            </div>

            <div className={styles.checkoutSummary}>
              <span className={styles.totalLabel}>Total del pedido</span>
              <span className={styles.totalAmount}>${finalTotal.toFixed(2)}</span>
            </div>

            <button type="submit">Enviar pedido por WhatsApp</button>
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
