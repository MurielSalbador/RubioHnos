// middlewares/role.middleware.js
export const isAdminOrSuperAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "superAdmin") {
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado" });
};
