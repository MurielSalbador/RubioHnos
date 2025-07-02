import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaKey } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PasswordReset.css";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Estados para formulario de solicitud de mail
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);

  // Estados para formulario de cambio de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Envío de mail para resetear ---
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setValidated(true);

    if (!email.trim() || !emailRegex.test(email)) {
      return; // no enviar si inválido
    }

    // Aquí podrías llamar al backend con axios para enviar el mail
    axios
      .post(`${API_URL}/api/password/forgot-password`, { email })
      .then(() => {
        toast.success(
          `Si el correo está registrado, te enviamos un enlace a ${email}`
        );
        setEmail("");
        setValidated(false);
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(() => {
        toast.error("Error en el servidor al enviar el correo.");
      });
  };

  // --- Cambio de contraseña ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.info("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/password/reset-password`,
        {
          token,
          newPassword,
        }
      );

      toast.success(
        res.data.message || "Contraseña actualizada correctamente."
      );
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Error al restablecer la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  // Validaciones para email
  const isEmpty = validated && !email.trim();
  const isInvalidFormat = validated && email.trim() && !emailRegex.test(email);

  if (!token) {
    // FORMULARIO para solicitar mail (primer componente)
    return (
      <div className="password-reset__page">
        <form
          className="password-reset__card"
          onSubmit={handleEmailSubmit}
          noValidate
          data-aos="zoom-in"
          data-aos-duration="700"
          data-aos-delay="200"
        >
          <h2 className="password-reset__title">
            ¿Problemas para iniciar sesión?
          </h2>
          <div className="password-reset__content">
            <div className="password-reset__icon">
              <FaKey size={40} />
            </div>
            <h2 className="password-reset__title">
              ¿Problemas para iniciar sesión?
            </h2>
            <p className="password-reset__desc">
              Ingresá tu correo y te enviaremos un enlace para recuperar tu
              cuenta.
            </p>
            <input
              type="email"
              placeholder="Ingresá tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`password-reset__input ${
                isEmpty || isInvalidFormat ? "is-invalid" : ""
              }`}
              aria-invalid={isEmpty || isInvalidFormat}
            />
            {isEmpty && (
              <div className="password-reset__error">
                Por favor, ingresá tu correo electrónico.
              </div>
            )}
            {isInvalidFormat && (
              <div className="password-reset__error">
                Por favor, ingresá un correo electrónico válido.
              </div>
            )}
            <button type="submit" className="password-reset__button">
              Enviar enlace de acceso
            </button>

            <a href="#" className="password-reset__link">
              ¿No podés restablecer tu contraseña?
            </a>

            <div className="password-reset__divider">
              <span>O</span>
            </div>

            <a
              href="#"
              className="password-reset__link password-reset__link--strong"
              onClick={() => navigate("/register")}
            >
              Crear nueva cuenta
            </a>

            <button
              type="button"
              className="password-reset__back"
              onClick={() => navigate("/login")}
            >
              Volver al Login
            </button>
          </div>
        </form>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          pauseOnHover
          theme="dark"
        />
      </div>
    );
  }

  // FORMULARIO para cambiar contraseña (segundo componente)
  return (
    <div className="reset-password-container">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handlePasswordSubmit}>
        <label>Nueva contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nueva contraseña"
          required
        />

        <label>Confirmar contraseña:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar contraseña"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PasswordReset;
