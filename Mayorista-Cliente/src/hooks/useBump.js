import { useEffect, useRef, useState } from "react";

// Hace "saltar" el contador cuando cambia (feedback al agregar productos)
export function useBump(value) {
  const [bump, setBump] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [value]);
  return bump;
}
