import { useState } from "react";
import { useCart } from "../../../../store.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModalPurchase from "../../../modal/ModalPurchase.jsx";
import CloseButton from "react-bootstrap/CloseButton";
import styles from "./FinishCart.module.css";

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

  const { cart, clearCart, setCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
  });

  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  //acount
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userEmail = user?.email || "";

  const userOrdersKey = `orders_${userEmail}`;

  //sum cart
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactClick = (contact) => {
    const { name, city, address } = formData;

    if (
      name.trim().length < 3 ||
      city.trim().length < 2 ||
      address.trim().length < 5
    ) {
      alert(
        "Por favor completá todos los campos correctamente antes de elegir el contacto."
      );
      return;
    }

    setSelectedContact(contact);
  };




// Agrega un producto al carrito, validando contra el stock disponible
const addToCart = (product) => {
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    if (existingProduct.quantity < product.stock) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      alert("Has alcanzado el límite de stock disponible para este producto.");
    }
  } else {
    if (product.stock > 0) {
      setCart([...cart, { ...product, quantity: 1 }]);
    } else {
      alert("Este producto no tiene stock disponible.");
    }
  }
};


  //stock
 const finishPurchase = async () => {
  try {
    const token = localStorage.getItem("token");

    const updates = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    await fetch("http://localhost:3000/api/products/decrement-multiple", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    return true;
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    alert("Error al actualizar el stock. Intentá nuevamente.");
    return false;
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, city, address } = formData;

    if (cart.length === 0) {
      alert("Tu carrito está vacío...");
      return;
    }

    if (name.trim().length < 3) {
      alert("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (city.trim().length < 2) {
      alert("La localidad debe tener al menos 2 caracteres.");
      return;
    }
    if (address.trim().length < 5) {
      alert("La dirección debe tener al menos 5 caracteres.");
      return;
    }
    if (!user) {
      alert("Debés iniciar sesión para confirmar la compra.");
      navigate("/login");
      return;
    }

    if (!selectedContact) {
      alert("Por favor seleccioná un contacto antes de confirmar la compra.");
      return;
    }

    const newOrder = {
      name,
      city,
      address,
      items: cart,
      total: total.toFixed(2),
      date: new Date().toLocaleString(),
    };

    const previousOrders =
      JSON.parse(localStorage.getItem(userOrdersKey)) || [];
    localStorage.setItem(
      userOrdersKey,
      JSON.stringify([...previousOrders, newOrder])
    );

    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:3000/api/orders", newOrder, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const stockUpdated = await finishPurchase();
      if (!stockUpdated) return;

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

    💰 Total: $${newOrder.total}

    ¡Gracias por tu compra! 🙌`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${
        selectedContact.phone
      }&text=${encodeURIComponent(message)}`;

      clearCart();
      setShowModal(true);
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("Error al guardar pedido:", err);
      alert("Hubo un error al guardar el pedido. Intentalo de nuevo.");
    }
  };

  return (
    <>
      <main className={styles.finishCart}>
        <div className={styles.container}>
          <div className={styles.contactClose}>
            <CloseButton
              aria-label="Cerrar formulario"
              onClick={() => navigate("/")}
            />
          </div>

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Logo"
            className={styles.whatsappLogo}
          />

          <h1>Finalizar Compra</h1>

          <form className={styles.checkoutForm} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Nombre completo:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div>
              <label htmlFor="city">Localidad:</label>
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
            </div>

            <div>
              <label htmlFor="address">Dirección de envío:</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                minLength={5}
              />
            </div>

            <div className={styles.checkoutSummary}>
              <p>
                Total a pagar: <strong>${total.toFixed(2)}</strong>
              </p>
            </div>

            <p>Elegí con quién querés contactarte:</p>
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

              {selectedContact && (
                <p className={styles.selectedMessage}>
                  Vas a contactarte con <strong>{selectedContact.name}</strong>{" "}
                  por WhatsApp 📱
                </p>
              )}

              <div className={styles.copyMessageContainer}>
                <button
                  type="button"
                  onClick={() => {
                    const { name, city, address } = formData;
                    // Antes del POST al backend
                    const newOrder = {
                      name,
                      city,
                      address,
                      items: cart,
                      total: total.toFixed(2),
                      date: new Date().toLocaleString(), // <- agregar esto
                    };

                    const message = `🛒 *Nuevo Pedido Realizado* por *${
                      user.name || "usuario"
                    }* (${user.email || "sin email"}):

                    👤 *Nombre:* ${name}
                    🏙️ *Localidad:* ${city}
                    📍 *Dirección:* ${address}
                    🕒 *Fecha:* ${newOrder.date}

                    📦 *Productos:*
                    ${cart
                      .map(
                        (item) =>
                          `• ${item.title} x${item.quantity} - $${(
                            item.price * item.quantity
                          ).toFixed(2)}`
                      )
                      .join("\n")}

                    💰 *Total:* $${newOrder.total}

                    ¡Gracias por tu compra! 🙌`;

                    navigator.clipboard
                      .writeText(message)
                      .then(() => alert("Mensaje copiado al portapapeles ✅"))
                      .catch(() => alert("No se pudo copiar el mensaje 😞"));
                  }}
                  className={styles.copyButton}
                >
                  📋 Copiá tu mensaje ya listo para enviar
                </button>
              </div>
            </div>

            <button type="submit">Confirmar Compra</button>
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
