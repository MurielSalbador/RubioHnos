import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import CloseButton from "react-bootstrap/CloseButton";
import "react-toastify/dist/ReactToastify.css";
import "./ForgotPassword.css";


const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    const isEmpty = !email.trim();
    const isInvalidFormat = email.trim() && !emailRegex.test(email);

    if (isEmpty || isInvalidFormat) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/password/forgot-password`,
        { email }
      );

      toast.success(
        `📧 Si el correo está registrado, te enviamos un enlace a ${email}`,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        }
      );

      setEmail("");
      setValidated(false);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error("⚠️ Error del servidor. Intentá de nuevo más tarde.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const isEmpty = validated && !email.trim();
  const isInvalidFormat = validated && email.trim() && !emailRegex.test(email);

  return (
    <div className="forgot-password-container">
      <div className="contact-close">
              <CloseButton
                aria-label="Cerrar formulario"
                onClick={() => navigate("/login")}
              />
            </div>
      <form onSubmit={handleSubmit} className="forgot-password-form" noValidate>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresá tu correo y te enviaremos un enlace para restablecerla.</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`forgot-password-input ${
            isEmpty || isInvalidFormat ? "is-invalid" : ""
          }`}
          aria-invalid={isEmpty || isInvalidFormat}
        />

        {isEmpty && (
          <div className="forgot-password-error">
            Por favor, ingresá tu correo electrónico.
          </div>
        )}
        {isInvalidFormat && (
          <div className="forgot-password-error">
            Por favor, ingresá un correo electrónico válido.
          </div>
        )}

        <button type="submit" className="forgot-password-button">
          Enviar enlace
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ForgotPassword;