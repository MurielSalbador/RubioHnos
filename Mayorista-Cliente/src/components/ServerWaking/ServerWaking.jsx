import { useEffect, useState } from "react";

// El servidor gratuito de Render se "duerme" si nadie entra por un rato y
// tarda unos segundos en volver. Si la carga demora, avisamos amablemente
// en lugar de dejar la pantalla como si estuviera trabada.
export default function ServerWaking({ delay = 4000 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  return (
    <div className="server-waking" role="status">
      <span className="server-waking-icon">☕</span>
      <div>
        <strong>Estamos preparando todo…</strong>
        <p>La primera carga puede tardar unos segundos. ¡Gracias por la paciencia!</p>
      </div>
    </div>
  );
}
