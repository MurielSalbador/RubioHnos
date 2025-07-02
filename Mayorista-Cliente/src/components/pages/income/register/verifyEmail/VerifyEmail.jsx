import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

const API_URL= import.meta.env.VITE_BASE_SERVER_URL;

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verificando...");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/verify/${token}`);
        setStatus(res.data.message);
        setSuccess(true);
      } catch (err) {
        if (err.response) {
          setStatus(err.response.data.message);
        } else {
          setStatus("Error de conexión con el servidor.");
        }
        setSuccess(false);
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className={`verify-container ${success === true ? "success" : success === false ? "error" : ""}`}>
      <div className="verify-box">
        {success === null ? (
          <div className="loader"></div>
        ) : (
          <>
            <div className="icon">{success ? "✅" : "❌"}</div>
            <h2>{status}</h2>
            {success && <Link to="/login" className="btn-link">Ir a Iniciar Sesión</Link>}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
