import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaCheckCircle } from 'react-icons/fa';
import "./ModalRegister.css";

function ModalSuccess({ show, handleClose }) {
  return (
    <Modal 
    show={show} 
    onHide={handleClose}
    dialogClassName="custom-modal"
    contentClassName="custom-modal-content"
    centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
        <FaCheckCircle style={{ color: '#0ad826', marginRight: '8px' }} />
          Cuenta creada con éxito
          </Modal.Title>
      </Modal.Header>
      <Modal.Body>Ahora podés iniciar sesión con tu cuenta.</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Ir a Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalSuccess;