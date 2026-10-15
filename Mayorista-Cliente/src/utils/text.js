// "ACEITE DE COCO" -> "Aceite de coco" (las siglas como TACC quedan en mayúscula)
export function prettyName(text = "") {
  const s = String(text).trim();
  if (!s) return s;
  const lower = s.toLocaleLowerCase("es-AR");
  return (lower.charAt(0).toLocaleUpperCase("es-AR") + lower.slice(1)).replace(/\btacc\b/gi, "TACC");
}
