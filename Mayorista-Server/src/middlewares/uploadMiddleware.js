import multer from "multer";
import path from "path";

import fs from "fs";
const dir = path.resolve("uploads");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada");
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Asegúrate de que exista esta carpeta
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Filtro de tipos de archivos
const fileFilter = (req, file, cb) => {
  console.log("📷 Procesando archivo recibido:", file.mimetype, file.originalname);
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagen no válido"), false);
  }
};


export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo
  },
});
