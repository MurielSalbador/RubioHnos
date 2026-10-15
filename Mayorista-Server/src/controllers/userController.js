import User from "../mongoModels/user.mongo.js";

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "id username email role isBlocked");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// Cambiar rol de usuario
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin", "superAdmin"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.role = role;

    // Modificar el dominio del email según el rol
    const usernameOnly = user.email.split("@")[0];
    if (role === "user") {
      user.email = `${usernameOnly}@gmail.com`;
    } else if (role === "admin") {
      user.email = `${usernameOnly}@admin.com`;
    } else if (role === "superAdmin") {
      user.email = `${usernameOnly}@superadmin.com`;
    }

    await user.save();

    res.json({ message: "Rol y email actualizados", user });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

// Bloquear/desbloquear usuario
export const toggleBlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `Usuario ${user.isBlocked ? "bloqueado" : "desbloqueado"}` });
  } catch (err) {
    res.status(500).json({ error: "Error al bloquear/desbloquear" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
