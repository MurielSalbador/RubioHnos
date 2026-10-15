import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheck } from "react-icons/fa";
import AuthLayout, { AuthField } from "../AuthLayout.jsx";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Qué tan segura es la contraseña (0 a 4) para la barrita de colores
function passwordScore(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const SCORE_LABEL = ["Muy corta", "Débil", "Aceptable", "Buena", "Excelente"];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const errors = {
    username: form.username.trim().length < 2 ? "Contanos tu nombre." : "",
    email: !emailOk(form.email) ? "Revisá el email (ej: nombre@gmail.com)." : "",
    password: form.password.length < 6 ? "Mínimo 6 caracteres." : "",
    confirmPassword:
      form.confirmPassword !== form.password || !form.confirmPassword ? "Las contraseñas no coinciden." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const score = passwordScore(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setServerError("");
    if (hasErrors || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || data.error || "No pudimos crear la cuenta.");
        return;
      }

      // Entramos directo con la cuenta nueva (antes había que volver a escribir todo)
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const session = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem("token", session.token);
        localStorage.setItem("user", JSON.stringify(session.user));
        toast.success(`¡Bienvenido/a, ${session.user?.username || ""}! Tu cuenta está lista 🎉`);
        const redirect = localStorage.getItem("redirectAfterLogin");
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect || "/shop");
      } else {
        toast.success("¡Cuenta creada! Ya podés iniciar sesión.");
        navigate("/login");
      }
    } catch {
      setServerError("No pudimos conectar con el servidor. Probá de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  const show = (field) => (touched ? errors[field] : "");

  return (
    <AuthLayout>
      <h1 className="auth-title">Creá tu cuenta</h1>
      <p className="auth-subtitle">Es gratis y te lleva un minuto.</p>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <AuthField id="reg-name" label="Tu nombre" autoComplete="given-name" icon={<FaUser />}
          value={form.username} onChange={set("username")} error={show("username")} />
        <AuthField id="reg-email" type="email" label="Correo electrónico" autoComplete="email" icon={<FaEnvelope />}
          value={form.email} onChange={set("email")} error={show("email")} />
        <AuthField
          id="reg-password"
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          autoComplete="new-password"
          icon={<FaLock />}
          value={form.password}
          onChange={set("password")}
          error={show("password")}
          right={
            <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />
        {form.password && (
          <div className={`auth-strength s${score}`} aria-live="polite">
            <div className="auth-strength-bar"><span /><span /><span /><span /></div>
            <small>{SCORE_LABEL[score]}</small>
          </div>
        )}
        <AuthField
          id="reg-confirm"
          type={showPassword ? "text" : "password"}
          label="Repetí la contraseña"
          autoComplete="new-password"
          icon={<FaLock />}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={show("confirmPassword")}
          right={
            form.confirmPassword && form.confirmPassword === form.password ? (
              <span className="auth-match" aria-label="Coinciden"><FaCheck /></span>
            ) : null
          }
        />

        {serverError && <p className="auth-alert">{serverError}</p>}

        <button type="submit" className={`auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
          <span>{loading ? "Creando tu cuenta…" : "Crear mi cuenta"}</span>
          {!loading && <FaArrowRight />}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
