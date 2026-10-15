import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import AuthLayout, { AuthField } from "../../AuthLayout.jsx";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isEmpty = validated && !email.trim();
  const isInvalidFormat = validated && email.trim() && !emailRegex.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!email.trim() || !emailRegex.test(email) || sending) return;

    setSending(true);
    try {
      await axios.post(`${API_URL}/api/password/forgot-password`, { email: email.trim() });
      setSent(true);
    } catch {
      toast.error("No pudimos enviar el correo. Intentá de nuevo más tarde.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthLayout showTabs={false}>
      {sent ? (
        <div className="auth-done">
          <div className="auth-done-icon">✉️</div>
          <h1 className="auth-title">¡Revisá tu correo!</h1>
          <p className="auth-subtitle">
            Si <strong>{email}</strong> está registrado, te mandamos un enlace para crear una contraseña nueva.
            Vence en 1 hora. Mirá también en "Spam".
          </p>
          <Link to="/login" className="auth-submit as-link"><span>Volver a iniciar sesión</span></Link>
        </div>
      ) : (
        <>
          <h1 className="auth-title">¿Olvidaste tu contraseña?</h1>
          <p className="auth-subtitle">Tranqui, nos pasa a todos. Te mandamos un enlace para crear una nueva.</p>
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <AuthField
              id="forgot-email"
              type="email"
              label="Correo electrónico"
              autoComplete="email"
              icon={<FaEnvelope />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={isEmpty ? "Ingresá tu correo electrónico." : isInvalidFormat ? "Revisá el email (ej: nombre@gmail.com)." : ""}
            />
            <button type="submit" className={`auth-submit ${sending ? "loading" : ""}`} disabled={sending}>
              <span>{sending ? "Enviando…" : "Enviar enlace"}</span>
              {!sending && <FaArrowRight />}
            </button>
          </form>
          <p className="auth-switch">
            ¿Te acordaste? <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
