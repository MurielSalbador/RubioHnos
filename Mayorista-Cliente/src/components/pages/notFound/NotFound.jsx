import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-subtitle">Página no encontrada</p>
      <p className="notfound-description">
        Lo sentimos, la página que buscás no existe o fue movida.
      </p>
      <button className="notfound-button" onClick={handleGoHome}>
        Volver al inicio
      </button>
    </div>
  );
}
