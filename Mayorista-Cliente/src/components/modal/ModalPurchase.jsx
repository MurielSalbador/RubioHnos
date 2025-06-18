import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import "./ModalPurchase.css"

function ModalPurchase({ show, onHide }) {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onHide();
    navigate('/');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>✅ Compra Realizada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <h4>¡Gracias por tu compra!</h4>
        <p>Esperá la pronta comunicación del proveedor. 💬</p>
        <img
          src="https://1000marcas.net/wp-content/uploads/2024/01/Red-Heart-Emojis.png"
          alt="Gracias"
          style={{ width: '100px', marginBottom: '1rem' }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleGoToLogin}>
          Ir al inicio
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalPurchase;
