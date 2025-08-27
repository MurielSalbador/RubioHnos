import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
  if (typeof window === "undefined") return null; // 🚩 evita errores en build
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || null;
};

export const isAdminOrSuperAdmin = () => {
  if (typeof window === "undefined") return false; // 🚩
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "admin" || user?.role === "superAdmin";
  } catch {
    return false;
  }
};

export const isSuperAdmin = () => {
  if (typeof window === "undefined") return false; // 🚩
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "superAdmin";
  } catch {
    return false;
  }
};

export const logout = () => {
  if (typeof window === "undefined") return; // 🚩
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const checkTokenExpiration = () => {
  if (typeof window === "undefined") return; // 🚩
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      logout();
    }
  } catch {
    logout();
  }
};
