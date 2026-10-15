import jwt from "jsonwebtoken";

// ⚠️ En Render tiene que estar definida la variable JWT_SECRET. El valor por
// defecto está escrito en el código público, así que cualquiera podría
// fabricar un token de administrador si se usa ese.
export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET no está configurado: usando el valor por defecto (inseguro)");
  }
  return process.env.JWT_SECRET || "rubio2025";
};

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    // Los tokens de "olvidé mi contraseña" no sirven para iniciar sesión
    if (err || user?.purpose === "reset") {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    next();
  });
};


// Middleware para verificar si el usuario es admin o superAdmin
export const isAdminOrSuperAdmin = (req, res, next) => {
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
  if (req.user?.role === "superAdmin") {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado" });
  }
};

