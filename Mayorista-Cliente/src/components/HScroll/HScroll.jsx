import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./HScroll.css";

// Fila que se desliza hacia los costados. Funciona con:
// - flechas (computadora), - rueda del mouse, - arrastrar, - dedo (celular).
// Lleva data-lenis-prevent para que el scroll suave de la página no se
// "coma" la rueda del mouse (por eso antes no se podía mover).
export default function HScroll({ children, className = "", step = 320 }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });

    // Rueda vertical -> desplazamiento horizontal
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      // En los extremos dejamos que la rueda siga moviendo la página
      if (el.scrollWidth <= el.clientWidth || atStart || atEnd) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "auto" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
    };
  }, [update, children]);

  const scrollBy = (dir) => ref.current?.scrollBy({ left: dir * step, behavior: "smooth" });

  // Arrastrar con el mouse
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse") return;
    drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    ref.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => { drag.current.down = false; };
  // Si arrastró, que no cuente como clic en un chip
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={`hscroll ${canLeft ? "can-left" : ""} ${canRight ? "can-right" : ""}`}>
      <button type="button" className="hscroll-arrow left" onClick={() => scrollBy(-1)} aria-label="Ver anteriores" tabIndex={canLeft ? 0 : -1}>
        <FaChevronLeft />
      </button>
      <div
        ref={ref}
        className={`hscroll-track ${className}`}
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
      <button type="button" className="hscroll-arrow right" onClick={() => scrollBy(1)} aria-label="Ver siguientes" tabIndex={canRight ? 0 : -1}>
        <FaChevronRight />
      </button>
    </div>
  );
}
