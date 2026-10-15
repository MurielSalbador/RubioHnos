import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import "./Register.css";
import ModalSuccess from "../../../modalRegister/ModalRegister.jsx";
import RegisterImg from "../../../../assets/register/imgRegister.webp";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

function Register() {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formIsValid = event.currentTarget.checkValidity();
    const passwordsMatch = formData.password === formData.confirmPassword;

    setValidated(true);

    // Verificación de validación del formulario y si las contraseñas coinciden
    if (!formIsValid || !passwordsMatch) return;

console.log("Datos recibidos para registro:", formData);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch {
      setError("No pudimos conectar con el servidor. Probá de nuevo en unos segundos.");
    }
  };

  return (
    <div
      className="register-background"
    >
      <div className="register-container">
        <div
          className="register-left"
          style={{ backgroundImage: `url(${RegisterImg})` }}
        ></div>
        <div className="register-right">
          <Link to="/" className="auth-back">
            <i className="fas fa-arrow-left"></i> Volver
          </Link>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
            className="register-form"
          >
            <h1 className="auth-title">Creá tu cuenta 🌱</h1>
            <p className="auth-subtitle">Es gratis y te lleva un minuto. Así podés hacer pedidos y seguirlos.</p>

            <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Tu nombre"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={validated && !formData.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingresá tu nombre.
                  </Form.Control.Feedback>
                </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={validated && !formData.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingresá un correo válido.
                  </Form.Control.Feedback>
                </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    isInvalid={validated && formData.password.length < 6}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres.
                  </Form.Control.Feedback>
                </Form.Group>
            <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    required
                    type="password"
                    placeholder="Repetí tu contraseña"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                    isInvalid={
                      validated &&
                      formData.confirmPassword !== formData.password
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    Las contraseñas no coinciden.
                  </Form.Control.Feedback>
                </Form.Group>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-leaf auth-submit">
              Crear mi cuenta
            </button>
            <p className="auth-switch">
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
            </p>
          </Form>
        </div>
      </div>

      <ModalSuccess
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          navigate("/login");
        }}
      />
    </div>
  );
}

export default Register;
