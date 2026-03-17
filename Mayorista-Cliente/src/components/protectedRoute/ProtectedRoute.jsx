// components/ProtectedRoute.jsx


//no ingresen manualmente a /addProducts
import { Navigate, useLocation } from "react-router-dom";
import { isAdminOrSuperAdmin, isAuthenticated } from "../../utils/auth.js";

const ProtectedRoute = ({ children, requiredAdmin = false }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const isAdmin = isAdminOrSuperAdmin();

  if (!isAuth) {
    // Guardamos la ruta a la que quería ir
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/login" />;
  }

  if (requiredAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
