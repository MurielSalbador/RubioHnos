import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaArrowLeft, FaLeaf, FaTruck, FaHeart } from "react-icons/fa";
import "./auth.css";

const PHRASES = [
  "Granolas artesanales hechas con amor",
  "Snacks saludables para todos los días",
  "Productos sin TACC y veganos",
  "Envíos a Rosario y alrededores",
];

// Frases que van cambiando solas en el panel de marca
function RotatingPhrase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PHRASES.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="auth-phrase" aria-live="polite">
      <span key={i}>{PHRASES[i]}</span>
    </p>
  );
}

// Estructura común de login, registro y recuperar contraseña
export default function AuthLayout({ children, showTabs = true }) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* Panel de marca */}
        <aside className="auth-brand">
          <Link to="/" className="auth-brand-logo">
            <img src="/logo-almendras.png" alt="" width="44" height="44" />
            <span>
              <strong>Rubio Hnos</strong>
              <small>Tienda natural</small>
            </span>
          </Link>

          {/* Fondo animado: manchas de luz y el logo grande de marca de agua */}
          <div className="auth-brand-glow g1" aria-hidden="true" />
          <div className="auth-brand-glow g2" aria-hidden="true" />
          <img src="/logo-almendras.png" className="auth-watermark" alt="" aria-hidden="true" />

          <div className="auth-brand-text">
            <h2>
              Comé rico.
              <br />
              <span>Comé natural.</span>
            </h2>
            <RotatingPhrase />
            <ul className="auth-perks">
              <li><FaLeaf /> 100% natural</li>
              <li><FaTruck /> Envíos a domicilio</li>
              <li><FaHeart /> Elegidos con amor</li>
            </ul>
          </div>
        </aside>

        {/* Formulario */}
        <main className="auth-panel">
          <Link to="/" className="auth-back">
            <FaArrowLeft /> Volver a la tienda
          </Link>

          {showTabs && (
            <nav className="auth-tabs" aria-label="Elegí una opción">
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                Crear cuenta
              </NavLink>
              <span className="auth-tabs-pill" />
            </nav>
          )}

          <div className="auth-content">{children}</div>
          <p className="auth-foot">Rubio Hnos © {new Date().getFullYear()} · Rosario y alrededores</p>
        </main>
      </div>
    </div>
  );
}

// Campo con ícono y etiqueta que "flota" al escribir
export function AuthField({ icon, label, error, right, ...inputProps }) {
  return (
    <div className={`auth-field ${error ? "has-error" : ""}`}>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input placeholder=" " {...inputProps} aria-invalid={Boolean(error)} />
        <label htmlFor={inputProps.id}>{label}</label>
        {right}
      </div>
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
}
