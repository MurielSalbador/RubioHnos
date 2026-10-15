import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../auth.css";

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (newPassword !== confirmPassword) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/password/reset-password`, { token, newPassword });
      toast.success(res.data.message || "¡Listo! Ya podés iniciar sesión con tu nueva contraseña.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos cambiar la contraseña. Pedí un enlace nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card-icon">🔒</div>
        <h1 className="auth-title">Creá tu nueva contraseña</h1>
        <p className="auth-subtitle">Elegí una que tengas a mano y que tenga al menos 6 caracteres.</p>

        <label className="auth-field">
          <span>Nueva contraseña</span>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <label className="auth-field">
          <span>Repetí la contraseña</span>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Igual a la de arriba"
          />
        </label>
        <label className="auth-show">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Mostrar contraseñas
        </label>

        {error && (
          <p className="auth-error">
            {error} {error.includes("enlace") && <Link to="/forgot-password">Pedir otro</Link>}
          </p>
        )}

        <button type="submit" className="btn-leaf auth-submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;
