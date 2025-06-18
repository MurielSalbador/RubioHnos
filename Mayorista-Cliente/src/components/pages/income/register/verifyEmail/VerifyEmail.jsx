import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verificando...");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/auth/verify/${token}`);
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
