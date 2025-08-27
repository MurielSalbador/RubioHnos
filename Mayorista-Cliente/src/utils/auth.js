import jwtDecode from "jwt-decode";

export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || null;
};

export const isAdminOrSuperAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "admin" || user?.role === "superAdmin";
  } catch {
    return false;
  }
};

export const isSuperAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "superAdmin";
  } catch {
    return false;
  }
};

// 🔹 Cerrar sesión (borrar token y user del storage)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login"; // redirige automáticamente al login
};

// 🔹 Verificar expiración del token
export const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // tiempo actual en segundos

    if (decoded.exp < now) {
      logout(); // si ya venció, cerrar sesión
    }
  } catch (err) {
    logout(); // si el token está dañado
  }
};

