import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaTimes, FaTag, FaStore } from "react-icons/fa";
import { getAllProducts } from "../../../api/fakeStoreApi.js";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue.js";
import { getImageUrl } from "../../../utils/image.js";
import { prettyName } from "../../../utils/text.js";
import { formatPrice } from "../cart/Cart/useProductCartState.js";
import "./SearchSuggest.css";

// Sin tildes y en minúscula, para comparar "azucar" con "Azúcar"
const norm = (s = "") => s.toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Resalta la parte del texto que coincide con lo que se escribió
function Highlight({ text, query }) {
  const i = norm(text).indexOf(norm(query));
  if (!query || i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function SearchSuggest({ value, onChange, categories = [], brands = [], onPickProduct, onPickCategory, onPickBrand, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const term = useDebouncedValue(value.trim(), 200);

  const { data, isFetching } = useQuery({
    queryKey: ["products", "suggest", term],
    queryFn: () => getAllProducts({ search: term, page: 1, limit: 6 }),
    enabled: term.length >= 2,
    staleTime: 1000 * 60,
  });

  const products = term.length >= 2 ? data?.docs || [] : [];
  const total = data?.totalDocs ?? 0;

  const matchCats = useMemo(
    () => (term.length >= 2 ? categories.filter((c) => norm(c.nombre).includes(norm(term))).slice(0, 4) : []),
    [categories, term]
  );
  const matchBrands = useMemo(
    () => (term.length >= 2 ? brands.filter((b) => norm(b).includes(norm(term))).slice(0, 4) : []),
    [brands, term]
  );

  // Lista plana para moverse con el teclado
  const items = [
    ...matchCats.map((c) => ({ type: "cat", value: c })),
    ...matchBrands.map((b) => ({ type: "brand", value: b })),
    ...products.map((p) => ({ type: "product", value: p })),
  ];

  useEffect(() => setActive(-1), [term]);

  // Cerrar al tocar afuera
  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  const pick = (item) => {
    setOpen(false);
    if (item.type === "cat") onPickCategory?.(item.value.nombre);
    else if (item.type === "brand") onPickBrand?.(item.value);
    else onPickProduct?.(item.value);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) pick(items[active]);
      else {
        setOpen(false);
        onSubmit?.();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && term.length >= 2;
  let idx = -1;

  return (
    <div className="shop-search ss-box" ref={boxRef}>
      <FaSearch className="shop-search-icon" />
      <input
        type="search"
        placeholder="Buscá granola, miel, yerba, galletitas…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Buscar productos"
        aria-expanded={showPanel}
        aria-autocomplete="list"
        autoComplete="off"
      />
      {value && (
        <button className="shop-search-clear" onClick={() => { onChange(""); setOpen(false); }} aria-label="Borrar búsqueda">
          <FaTimes />
        </button>
      )}

      {showPanel && (
        <div className="ss-panel" role="listbox" data-lenis-prevent>
          {(matchCats.length > 0 || matchBrands.length > 0) && (
            <div className="ss-chips">
              {matchCats.map((c) => {
                idx += 1;
                const i = idx;
                return (
                  <button key={`c-${c._id}`} className={`ss-chip ${active === i ? "active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => pick({ type: "cat", value: c })}>
                    <FaTag /> <Highlight text={prettyName(c.nombre)} query={term} />
                  </button>
                );
              })}
              {matchBrands.map((b) => {
                idx += 1;
                const i = idx;
                return (
                  <button key={`b-${b}`} className={`ss-chip ${active === i ? "active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => pick({ type: "brand", value: b })}>
                    <FaStore /> <Highlight text={b} query={term} />
                  </button>
                );
              })}
            </div>
          )}

          {products.length > 0 ? (
            <ul className="ss-list">
              {products.map((p) => {
                idx += 1;
                const i = idx;
                return (
                  <li key={p._id}>
                    <button className={`ss-item ${active === i ? "active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => pick({ type: "product", value: p })}>
                      <img src={getImageUrl(p.imageUrl, 120)} alt="" loading="lazy" />
                      <span className="ss-item-text">
                        <span className="ss-item-title"><Highlight text={p.title} query={term} /></span>
                        <small>{p.brand}</small>
                      </span>
                      <span className="ss-item-price">{formatPrice(p.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            !isFetching && matchCats.length === 0 && matchBrands.length === 0 && (
              <p className="ss-empty">No encontramos “{term}”. Probá con otra palabra.</p>
            )
          )}

          {isFetching && products.length === 0 && <p className="ss-empty">Buscando…</p>}

          {total > products.length && (
            <button className="ss-all" onClick={() => { setOpen(false); onSubmit?.(); }}>
              Ver los {total} resultados para “{term}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
