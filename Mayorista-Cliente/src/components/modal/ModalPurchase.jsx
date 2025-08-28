import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from "react-icons/fa";
import "./ModalPurchase.css";

function ModalPurchase({ show, onHide }) {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onHide();
    navigate('/');
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Body className="text-center p-4">
        <div className="success-icon">
          <FaCheckCircle className="check-icon" />
        </div>
        <h4 className="mt-3 fw-bold">¡Compra Realizada!</h4>
        <p className="text-muted">
          Gracias por tu compra. En breve el proveedor se comunicará contigo 💬
        </p>
        <Button 
          variant="success" 
          onClick={handleGoToLogin} 
          className="mt-3 w-100 rounded-pill fw-semibold"
        >
          Ir al inicio
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default ModalPurchase;
