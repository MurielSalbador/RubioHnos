import jwt from "jsonwebtoken";

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token recibido:", token);

  if (!token) {
    console.log("❌ Token no proporcionado");
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const secret = process.env.JWT_SECRET || "rubio2025";

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log("❌ Token inválido");
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    console.log("✅ Usuario autenticado:", user);
    next();
  });
};


// Middleware para verificar si el usuario es admin o superAdmin
export const isAdminOrSuperAdmin = (req, res, next) => {
  console.log("Middleware isAdminOrSuperAdmin. Rol:", req.user?.role);
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const { role } = req.user;

  if (role === "admin" || role === "superAdmin") {
    return next();
  }

  return res.status(403).json({ error: "No tienes permisos para esta acción" });
};


export const isSuperAdmin = (req, res, next) => {
  console.log("Rol del usuario en middleware isSuperAdmin:", req.user?.role);
  if (req.user?.role === "superAdmin") {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado" });
  }
};

