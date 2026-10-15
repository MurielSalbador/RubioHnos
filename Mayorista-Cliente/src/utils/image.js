// utils/image.js
// Normaliza la URL de la imagen de un producto y, si viene de Cloudinary,
// pide una versión reducida y optimizada (webp/avif, calidad automática).
// Esto hace que el catálogo cargue mucho más rápido con muchos productos.

const API_URL = import.meta.env.VITE_BASE_SERVER_URL;

export function getImageUrl(url, width) {
  if (!url) return "";

  let full = url;
  if (!/^(https?:|data:|blob:)/.test(url)) {
    full = `${API_URL}/${url.replace(/^\/+/, "")}`;
  }

  if (width && full.includes("res.cloudinary.com") && full.includes("/upload/")) {
    const [base, rest] = full.split("/upload/");
    // Si ya tiene transformaciones (f_auto, w_...) no las duplicamos
    if (!/^[a-z]{1,3}_[^/]*\//.test(rest) || /^v\d+\//.test(rest)) {
      return `${base}/upload/f_auto,q_auto,c_limit,w_${width}/${rest}`;
    }
  }

  return full;
}

// Reduce el tamaño de una foto antes de subirla (las fotos del celular suelen
// pesar 3-8MB). Si algo falla devolvemos el archivo original.
export async function compressImage(file, maxSize = 1200, quality = 0.82) {
  if (!file || !file.type?.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  // Las imágenes chicas no vale la pena procesarlas
  if (file.size < 300 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
