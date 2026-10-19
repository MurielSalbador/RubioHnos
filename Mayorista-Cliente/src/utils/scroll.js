// La página usa scroll suave (Lenis): los scrolls "a mano" tienen que pasar
// por él, si no Lenis vuelve a la posición anterior.
let lenis = null;

export const registerLenis = (instance) => {
  lenis = instance;
};

export function scrollToElement(el, offset = -90) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}
