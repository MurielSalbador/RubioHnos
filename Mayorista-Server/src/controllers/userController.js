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

    // Antes también se cambiaba el email (ej. juan@gmail.com -> juan@admin.com),
    // con lo que la persona ya no podía iniciar sesión ni ver sus pedidos.
    user.role = role;
    await user.save();

    const { password, ...safeUser } = user.toObject();
    res.json({ message: "Rol actualizado", user: safeUser });
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
    if (String(id) === String(req.user?.id)) {
      return res.status(400).json({ error: "No podés eliminar tu propio usuario" });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
