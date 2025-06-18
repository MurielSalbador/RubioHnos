// components/ProtectedRoute.jsx


//no ingresen manualmente a /addProducts
import { Navigate } from "react-router-dom";
import { isAdminOrSuperAdmin } from "../../utils/auth.js";

const ProtectedRoute = ({ children }) => {
  return isAdminOrSuperAdmin() ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
