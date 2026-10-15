import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaLock, FaArrowRight } from "react-icons/fa";
import AuthLayout, { AuthField } from "../../AuthLayout.jsx";

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
    <AuthLayout showTabs={false}>
      <h1 className="auth-title">Creá tu nueva contraseña</h1>
      <p className="auth-subtitle">Elegí una que recuerdes, de al menos 6 caracteres.</p>
      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <AuthField
          id="reset-new"
          type={showPassword ? "text" : "password"}
          label="Nueva contraseña"
          autoComplete="new-password"
          icon={<FaLock />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <AuthField
          id="reset-confirm"
          type={showPassword ? "text" : "password"}
          label="Repetí la contraseña"
          autoComplete="new-password"
          icon={<FaLock />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <label className="auth-check">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          <span /> Mostrar contraseñas
        </label>

        {error && (
          <p className="auth-alert">
            {error} {error.includes("enlace") && <Link to="/forgot-password">Pedir otro</Link>}
          </p>
        )}

        <button type="submit" className={`auth-submit ${loading ? "loading" : ""}`} disabled={loading}>
          <span>{loading ? "Guardando…" : "Guardar contraseña"}</span>
          {!loading && <FaArrowRight />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default PasswordReset;
