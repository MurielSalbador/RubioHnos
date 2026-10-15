// hooks/useInView.js
import { useCallback, useEffect, useRef, useState } from "react";

// Devuelve un ref (callback) y si el elemento está visible (o cerca) en pantalla.
// Lo usamos para cargar más productos automáticamente al hacer scroll.
// Es un callback ref para que funcione aunque el elemento aparezca más tarde
// (por ejemplo, después del "cargando...").
export function useInView({ rootMargin = "600px" } = {}) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef(null);

  const ref = useCallback(
    (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || typeof IntersectionObserver === "undefined") {
        setInView(false);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { rootMargin }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [rootMargin]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView];
}
