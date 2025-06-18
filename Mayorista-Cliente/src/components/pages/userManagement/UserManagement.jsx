import { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import { useNavigate } from "react-router-dom";
import "./UserManagement.css";

const API_URL = "http://localhost:3000/api/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔐 Token en fetchUsers:", token);

      setLoading(true);
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener los usuarios");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id, newRole) => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token en changeRole:", token);
    try {
      const res = await fetch(`${API_URL}/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("No se pudo cambiar el rol");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleBlock = async (id) => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token en toggleBlock:", token);
    try {
      const res = await fetch(`${API_URL}/${id}/block`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo bloquear/desbloquear");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token en deleteUser:", token);
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo eliminar el usuario");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="user-management">
       
      <div style={{ padding: "1rem" }}>
         <div className="close-button">
              <CloseButton
                aria-label="Cerrar formulario"
                onClick={() => navigate("/")}
              />
            </div>
        <h2>Gestión de Usuarios</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <div className="actions">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superAdmin">SuperAdmin</option>
                    </select>
                    <button onClick={() => toggleBlock(u.id)}>
                      {u.isBlocked ? "Desbloquear" : "Bloquear"}
                    </button>
                    <button onClick={() => deleteUser(u.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
