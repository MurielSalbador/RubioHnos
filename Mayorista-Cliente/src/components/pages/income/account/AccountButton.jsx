import { useEffect, useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AccountButton.css";

const AccountButton = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = () => {
    if (user) {
      setOpen(!open);
    } else {
      navigate("/login");
    }
  };

  const handleViewOrders = () => {
    navigate("/myOrders");
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="account-container" ref={menuRef}>
      <button className="account-button" onClick={handleClick}>
        {user ? <FaUserCircle size={28} /> : "Mi cuenta"}
      </button>

      {open && user && (
        <div className="account-dropdown">
          <p>{user.email}</p>



          {/* para ver las ordenes de los clientes */}
          {(user?.role === "admin" || user?.role === "superAdmin") && (
            <button
              onClick={() => {
                navigate("/allOrders");
                setOpen(false);
              }}
            >
              Pedidos de todos
            </button>
          )}


          <button onClick={handleViewOrders}>Ver mis compras</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

export default AccountButton;
