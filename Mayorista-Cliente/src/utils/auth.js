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