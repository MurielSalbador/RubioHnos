import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import LoginImg from "../../../../assets/login/imgLogin.webp";
import "./Login.css";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);

   try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (
      res.status === 403 &&
      data.error === "Este usuario está bloqueado."
    ) {
      toast.error("🚫 Tu cuenta ha sido bloqueada por un administrador.", {
        autoClose: 4000,
        theme: "colored",
      });
    } else {
      toast.error(data.error || "❌ Contraseña o Email incorrecto", {
        autoClose: 3000,
        theme: "colored",
      });
    }
    return;
  }
 

  // Guardar token y user en localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  toast.success("✔ Bienvenido!", {
    position: "top-right",
    autoClose: 3000,
    theme: "colored",
  });

  //Revisamos si había un destino pendiente
   const redirect = localStorage.getItem("redirectAfterLogin");
   if (redirect) {
     localStorage.removeItem("redirectAfterLogin"); // limpiar para no repetir
     navigate(redirect);
   } else {
     navigate("/");
   }

} catch {
  toast.error("⚠️ No pudimos conectar con el servidor. Probá de nuevo en unos segundos.", {
    autoClose: 4000,
    theme: "colored",
  });
} finally {
  setLoading(false);
}
  };

  return (
    <div className="login-background">
      <div className="login-container" data-aos="zoom-in">
        <div
          className="login-left"
          style={{ backgroundImage: `url(${LoginImg})` }}
        ></div>
        <div className="login-right">
          <Link to="/" className="auth-back">
            <i className="fas fa-arrow-left"></i> Volver
          </Link>
          <h1 className="auth-title">¡Hola de nuevo! 👋</h1>
          <p className="auth-subtitle">Entrá a tu cuenta para hacer pedidos y ver tu historial.</p>

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Revisá el email (ej: nombre@gmail.com).
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <div className="auth-password">
              <Form.Control
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              <Form.Control.Feedback type="invalid">
                La contraseña tiene al menos 6 caracteres.
              </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Link to="/forgot-password" className="auth-forgot">
              ¿Olvidaste tu contraseña?
            </Link>

            <button type="submit" className="btn-leaf auth-submit" disabled={loading}>
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </Form>

          <p className="auth-switch">
            ¿Es tu primera vez? <Link to="/register">Creá tu cuenta gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
