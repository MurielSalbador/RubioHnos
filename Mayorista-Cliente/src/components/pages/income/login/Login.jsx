import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import LoginImg from "../../../../assets/login/imgLogin.jpeg";
import "./Login.css";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

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
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } else {
      toast.error(data.error || "❌ Contraseña o Email incorrecto", {
        position: "top-right",
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

} catch (err) {
  toast.error("⚠️ Error en el servidor", {
    position: "top-right",
    autoClose: 3000,
    theme: "colored",
  });
}
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div
          className="login-left"
          style={{ backgroundImage: `url(${LoginImg})` }}
        ></div>
        <div className="login-right">
          <div className="login-header">
            <button className="back-arrow" onClick={() => navigate("/")}>
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
          <h3 className="text-center mb-4">Iniciar sesión</h3>

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Ingreso de correo inválido. Vuelva a intentar
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Form.Control.Feedback type="invalid">
                Ingreso de contraseña inválido. Vuelva a intentar
              </Form.Control.Feedback>
            </Form.Group>

            <div className="button-group">
              <Button
                type="submit"
                className="my-custom-button custom-button-register "
              >
                Iniciar Sesión
              </Button>
            </div>
          </Form>

          <Button
            onClick={handleRegisterClick}
            className="my-custom-button custom-button-register"
          >
            Registrarse
          </Button>

          <div className="faq-recomendation">
            <p className="text-center">
              Si olvidaste tu contraseña, hacé click en{" "}
              <a href="/forgot-password" className="custom-button-faq">
                Recuperarla
              </a>{" "}
              y seguí las instrucciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
