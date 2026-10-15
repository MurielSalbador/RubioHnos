import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import AuthLayout, { AuthField } from "../AuthLayout.jsx";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError = touched && !emailOk(email) ? "Revisá el email (ej: nombre@gmail.com)." : "";
  const passwordError = touched && password.length < 6 ? "La contraseña tiene al menos 6 caracteres." : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setServerError("");
    if (!emailOk(email) || password.length < 6 || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(
          res.status === 403 && data.error === "Este usuario está bloqueado."
            ? "Tu cuenta fue bloqueada por un administrador."
            : data.error || "Email o contraseña incorrectos."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`¡Hola, ${data.user?.username || ""}! 👋`);

      const redirect = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirect || "/");
    } catch {
      setServerError("No pudimos conectar con el servidor. Probá de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-title">¡Hola de nuevo!</h1>
      <p className="auth-subtitle">Entrá para hacer pedidos y seguir tus compras.</p>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <AuthField
          id="login-email"
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          icon={<FaEnvelope />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <AuthField
          id="login-password"
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          autoComplete="current-password"
          icon={<FaLock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          right={
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <div className="auth-row">
          <Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
        </div>

        {serverError && <p className="auth-alert">{serverError}</p>}

        <button type="submit" className={`auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
          <span>{loading ? "Entrando…" : "Iniciar sesión"}</span>
          {!loading && <FaArrowRight />}
        </button>
      </form>

      <p className="auth-switch">
        ¿Es tu primera vez? <Link to="/register">Creá tu cuenta gratis</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
