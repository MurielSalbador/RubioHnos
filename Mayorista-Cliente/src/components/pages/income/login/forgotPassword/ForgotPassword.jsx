import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../auth.css";

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
    <div className="login-background">
      <div className="auth-card">
        <Link to="/login" className="auth-back">
          <i className="fas fa-arrow-left"></i> Volver
        </Link>

        {sent ? (
          <>
            <div className="auth-card-icon">📬</div>
            <h1 className="auth-title">¡Revisá tu correo!</h1>
            <p className="auth-subtitle">
              Si <strong>{email}</strong> está registrado, te mandamos un enlace para crear una contraseña nueva.
              Vence en 1 hora. Mirá también en "Spam".
            </p>
            <Link to="/login" className="btn-leaf auth-submit">Volver a iniciar sesión</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-card-icon">🔑</div>
            <h1 className="auth-title">¿Olvidaste tu contraseña?</h1>
            <p className="auth-subtitle">Tranqui, nos pasa a todos. Ingresá tu email y te mandamos un enlace para crear una nueva.</p>

            <label className="auth-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={isEmpty || isInvalidFormat ? "invalid" : ""}
              />
            </label>
            {isEmpty && <p className="auth-error">Ingresá tu correo electrónico.</p>}
            {isInvalidFormat && <p className="auth-error">Revisá el email (ej: nombre@gmail.com).</p>}

            <button type="submit" className="btn-leaf auth-submit" disabled={sending}>
              {sending ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
