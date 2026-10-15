import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { FaInstagram, FaWhatsapp, FaPaperPlane, FaTruck, FaShoppingBasket, FaMoneyBillWave, FaUsers, FaHandshake, FaAward } from "react-icons/fa";
import Header from "../../header/Header.jsx";
import backgroundContact from "../../../assets/background/backgroundContact.webp";
import "./ContactForm.css";

const CONTACTS = [
  { name: "Hernan", phone: "5493416863976" },
  { name: "Ruddi", phone: "5493416946454" },
  { name: "Nacho", phone: "5493413916661" },
];

const FAQ = [
  { icon: <FaTruck />, q: "¿Hacen envíos a domicilio?", a: "¡Sí! Enviamos a Rosario, Alvarez, Piñero, Soldini y Pueblo Muñoz. El costo depende de la localidad y lo ves antes de confirmar." },
  { icon: <FaShoppingBasket />, q: "¿Cómo hago mi pedido?", a: "Agregá productos al carrito desde la tienda, completá tus datos de entrega y elegí con quién hablar. Tu pedido llega por WhatsApp y coordinamos todo ahí." },
  { icon: <FaMoneyBillWave />, q: "¿Qué medios de pago aceptan?", a: "Efectivo y transferencia bancaria. Lo acordás con el vendedor al finalizar la compra." },
  { icon: <FaTruck />, q: "¿Cuánto tarda la entrega?", a: "Hacemos entregas semanales, con un tiempo estimado de 3 a 5 días hábiles." },
];

const MAX_MESSAGE = 500;

const ContactForm = () => {
  const form = useRef();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await emailjs.sendForm("service_kjoccnh", "template_bnlk85j", form.current, "UkWj1Chi6zu-WlxCw");
      toast.success("¡Mensaje enviado! Te respondemos pronto 💌");
      form.current.reset();
      setMessage("");
    } catch {
      toast.error("No se pudo enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-text">
            <span className="home-eyebrow">Somos Rubio Hnos 🌿</span>
            <h1>Cuidamos lo que más querés</h1>
            <p>
              Productos naturales seleccionados con amor para que te sientas bien, te alimentes mejor y vivas en
              equilibrio. Porque no es solo comer: es elegir calidad, salud y bienestar todos los días.
            </p>
            <div className="contact-hero-cta">
              <a href="#contacto" className="btn-leaf"><FaPaperPlane /> Escribinos</a>
              <Link to="/shop" className="btn-ghost">Ver la tienda</Link>
            </div>
          </div>
          <img src={backgroundContact} alt="Mate y productos naturales" className="contact-hero-img" />
        </section>

        <section className="contact-cards">
          <article>
            <span className="contact-card-icon"><FaUsers /></span>
            <h3>Quiénes somos</h3>
            <p>Somos tres hermanos que decidimos emprender para acercarte alimentos naturales y de calidad.</p>
          </article>
          <article>
            <span className="contact-card-icon leaf"><FaHandshake /></span>
            <h3>Cómo trabajamos</h3>
            <p>Entregas por pedidos semanales, en 3 a 5 días hábiles.</p>
          </article>
          <article>
            <span className="contact-card-icon honey"><FaAward /></span>
            <h3>Nuestro compromiso</h3>
            <p>Calidad, confianza y buena atención en cada producto.</p>
          </article>
        </section>

        <section className="contact-faq" id="faq">
          <h2>Preguntas frecuentes</h2>
          {FAQ.map((item, i) => (
            <details key={i} open={i === 0}>
              <summary><span className="faq-icon">{item.icon}</span> {item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>

        <section className="contact-main" id="contacto">
          <div className="contact-left">
            <h2>¡Hablemos!</h2>
            <p>La forma más rápida es WhatsApp. También podés dejarnos un mensaje.</p>
            <div className="contact-wa-list">
              {CONTACTS.map((c) => (
                <a key={c.phone} href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer" className="wa-contact">
                  <span className="wa-avatar">{c.name[0]}</span>
                  <span className="wa-name">{c.name}</span>
                  <span className="wa-go"><FaWhatsapp /> Escribir</span>
                </a>
              ))}
            </div>
            <a href="https://www.instagram.com/rubio.hnos" target="_blank" rel="noopener noreferrer" className="contact-ig">
              <FaInstagram /> @rubio.hnos
            </a>
            <p className="contact-area">📍 Rosario y alrededores, Santa Fe · Atendemos todos los días</p>
          </div>

          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <label>
              <span>Nombre *</span>
              <input type="text" name="name" placeholder="Tu nombre" required autoComplete="name" />
            </label>
            <label>
              <span>Email *</span>
              <input type="email" name="email" placeholder="tu@email.com" required autoComplete="email" />
            </label>
            <label>
              <span>Teléfono (opcional)</span>
              <input type="tel" name="subject" placeholder="341 555 5555" autoComplete="tel" />
            </label>
            <label>
              <span>Mensaje *</span>
              <textarea
                name="message"
                placeholder="Contanos en qué te podemos ayudar…"
                maxLength={MAX_MESSAGE}
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <small className="contact-counter">{message.length} / {MAX_MESSAGE}</small>
            </label>
            <button type="submit" className="btn-leaf" disabled={sending}>
              <FaPaperPlane /> {sending ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        </section>

        <footer className="contact-footer">
          Rubio Hnos © {new Date().getFullYear()} · <Link to="/shop">Tienda</Link> ·{" "}
          <a href="https://www.instagram.com/rubio.hnos" target="_blank" rel="noopener noreferrer">Instagram</a>
        </footer>
      </main>
    </>
  );
};

export default ContactForm;
