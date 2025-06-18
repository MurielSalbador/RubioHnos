import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "./ContactForm.css";
import { useNavigate } from "react-router-dom";
import AccountButton from "../income/account/AccountButton.jsx";
import backgroundContact from "../../../assets/background/backgroundContact.jpeg";
import { FaGithub, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

//protected
import { isSuperAdmin } from "../../../utils/auth.js";

const ContactForm = () => {
  const form = useRef();
  const navigate = useNavigate();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_kjoccnh",
        "template_bnlk85j",
        form.current,
        "UkWj1Chi6zu-WlxCw"
      )
      .then(
        (result) => {
          console.log("Mensaje enviado ✅", result.text);
          alert("¡Mensaje enviado con éxito!");
          form.current.reset();
          setTimeout(() => {
            navigate("/");
          }, 1500);
        },
        (error) => {
          console.log("Error ❌", error.text);
          alert("Ocurrió un error al enviar el mensaje. Intenta nuevamente.");
        }
      );
  };

  return (
    <>
      {/* ========== HEADER ========== */}
      <header className="main-header">
        <div className="header-actions">
          <div className="nav-logo">
            <a
              href="/"
              className="logo-text"
              data-aos="fade-left"
              data-aos-duration="600"
              data-aos-delay="200"
            >
              <div className="logo-line-1">RubioHnos</div>
              <div className="logo-line-2">mayorista</div>
            </a>
          </div>

          <ul className="nav-center">
            <li>
              <a href="/" className="link">
                <i className="fa-solid fa-house"></i> Home
              </a>
            </li>
            <li>
              <a href="/contact" className="link">
                <i className="fa-solid fa-envelope"></i> Contactanos
              </a>
            </li>
              <li>
              <a href="/shop" className="link">
                <i className="fa-solid fa-shop"></i> Tienda
              </a>
            </li>
            <li>
              <a href="/myOrders" className="link">
                <i className="fa-solid fa-envelope"></i> Pedidos
              </a>
            </li>
            {isSuperAdmin() && (
              <li>
                <a href="/httpClients" className="link">
                  <i className="fa-solid fa-envelope"></i> Clientes
                </a>
              </li>
            )}
          </ul>

          <ul className="nav-right">
            <li>
              <a href="/cart" className="link">
                <i className="fa-solid fa-cart-shopping"></i> Mi carrito
              </a>
            </li>
            <li>
              <div className="link">
                <AccountButton />
              </div>
            </li>
          </ul>
        </div>
      </header>

      <section
        className="hero-section"
        data-aos="fade-right"
        data-aos-duration="600"
        data-aos-delay="200"
      >
        <div className="hero-content">
          <h1> Cuidamos lo que más querés</h1>
          <p>
            Productos naturales seleccionados con amor para que te sientas bien, te alimentes mejor y vivas en equilibrio.
          </p>
          <p>
            Porque sabemos que no es solo comer, es elegir calidad, salud y bienestar todos los días.
          </p>
          <button
            type="button"
            className="hero-button"
            onClick={() => {
              const faqSection = document.getElementById("faq");
              faqSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Más info
          </button>
        </div>
        <img src={backgroundContact} alt="mate" className="hero-dog" />
        <div className="hero-bottom-mask"></div>
      </section>

      <section className="contact-info-cards" data-aos-delay="100">
        <div className="card" data-aos="fade-up">
          <div className="card-icon">
            <i className="fa-solid fa-comments"></i>
          </div>
          <h3>Quiénes Somos</h3>
          <p>
            Somos tres hermanos que decidimos emprender con el propósito de acercarte alimentos naturales y de calidad.
          </p>
        </div>

        <div className="card" data-aos="fade-up" data-aos-delay="300">
          <div className="card-icon">
            <i className="fa-solid fa-handshake-simple"></i>
          </div>
          <h3>Cómo Trabajamos</h3>
          <p>
            Hacemos entregas por pedidos semanales, con un tiempo estimado de entrega de 3 a 5 días hábiles.
          </p>
        </div>

        <div className="card" data-aos="fade-up" data-aos-delay="500">
          <div className="card-icon">
            <i className="fa-solid fa-award"></i>
          </div>
          <h3>Mejores Servicios</h3>
          <p>Calidad, confianza y compromiso en cada producto y atención.</p>
        </div>
      </section>

      {/* Acordeón de Preguntas Frecuentes */}
      <section
        className="faq-section"
        id="faq"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="200"
      >
        <h2 className="title">Preguntas Frecuentes</h2>
        <details data-aos="fade-right" data-aos-delay="100">
          <summary>🚚 ¿Hacemos envíos a domicilio?</summary>
          <p>¡Sí! Enviamos a Rosario y alrededores con un costo adicional.</p>
        </details>
        <details data-aos="fade-left" data-aos-delay="400">
          <summary>🛒 ¿Cómo hago mi pedido?</summary>
          <p>Podés armar tu carrito eligiendo los productos y cantidades que quieras. Solo hacé clic en el botón del producto y agregalo al carrito. ¡Así de fácil!.</p>
        </details>
        <details data-aos="fade-right" data-aos-delay="400">
          <summary>💳 ¿Qué medios de pago aceptan?</summary>
          <p>
            Trabajamos con efectivo y transferencia bancaria. Al finalizar tu compra, podés hablar con nosotros y elegir el método que más te convenga.
          </p>
        </details>
      </section>

      {/* Ubicación y Horarios */}
      <section
        className="location-section"
        data-aos="fade-down"
        data-aos-duration="1000"
      >
        <h2 className="title">¿Dónde Estamos?</h2>
        <p>
          <strong>Dirección:</strong> Rosario y alrededores, Santa Fe, Argentina
        </p>
        <p>
          <strong>Horarios:</strong> Disponibles todos los días! No dudes en contactarnos para coordinar tu pedido.
        </p>
        <iframe
          title="Ubicación"
          src="https://www.google.com/maps/embed?..."
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      {/* ========== SECCIÓN DE CONTACTO ========== */}

      <div className="contact-section-two-columns">
        {/* Columna izquierda: Información de contacto */}
        <div className="contact-info-left">
          <h2>¡Contactanos!</h2>
          <p>
            No te quedes con dudas.
            <br />
            Te asistiremos en todo lo que necesites.
          </p>

          <div className="contact-item">
            <i className="fa-brands fa-instagram"></i>
            <div>
              <strong>Instagram</strong>
              <br />
              @rubio.hnos
            </div>
          </div>
        </div>

        {/* Columna derecha: Formulario */}
        <form ref={form} onSubmit={sendEmail} className="contact-form-right">
          <label>Primer Nombre *</label>
          <input
            type="text"
            name="name"
            placeholder="Ingresa tu nombre (obligatorio)"
            required
          />
          <label>Dirección de Correo electrónico *</label>
          <input
            type="email"
            name="email"
            placeholder="Ingresa tu mail (obligatorio)"
            required
          />
          <label>Número de Teléfono</label>
          <input
            type="text"
            name="subject"
            placeholder="Ingresa tu número de celular (opcional)"
          />
          <label>Mensaje</label>
          <textarea
            name="message"
            placeholder="Ingresá tu mensaje..."
            maxLength={180}
            required
          ></textarea>
          <div style={{ textAlign: "right", fontSize: "0.8rem" }}>0 / 180</div>
          <button type="submit">Enviar</button>
        </form>
      </div>

      <footer className="footer">
                  <div className="footer-container">
                    <div className="footer-logo-container">
                      <div className="footer-logo-text">
                        <div className="logo-line-1">RubioHnos</div>
                        <div className="logo-line-2">-Tienda Natural-</div>
                      </div>
                    </div>
                    <div className="footer-info">
                      <h3 className="footer-title">RubioHnos © 2025</h3>
                      <p className="footer-text">
                        Somos una tienda dedicada a la venta de productos naturales y
                        saludables. Nuestro objetivo es ofrecer lo mejor para su
                        bienestar.
                      </p>
                    </div>
                    <div className="footer-socials">
                      
                      <a
                        href="https://www.instagram.com/rubio.hnos?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaInstagram />
                      </a>
                      
                    
                    </div>
                  </div>
                  <div className="footer-bottom">
                    <div className="footer-links">
                      <a href="#">Términos</a>
                      <a href="#">Privacidad</a>
                      <a href="#">Contacto</a>
                    </div>
                  </div>
                </footer>
    </>
  );
};

export default ContactForm;
