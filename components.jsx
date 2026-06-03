// ==========================================================================
// EMICILS — Composants partagés
// ==========================================================================
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Icônes (traits fins, style épuré) ----------
const Ico = {
  cart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 4h2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6"/><circle cx="9.5" cy="20" r="1.1"/><circle cx="18" cy="20" r="1.1"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20s-7-4.5-9.3-9C1 7.7 2.6 4.7 5.7 4.7c2 0 3.3 1.2 4.3 2.6 1-1.4 2.3-2.6 4.3-2.6 3 0 4.7 3 3 6.3C19 15.5 12 20 12 20Z"/></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12.5l5 5L20 6"/></svg>,
  chevron: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  chevDown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.9 6.9 19.2l1-5.7-4.1-4 5.7-.8z"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  minus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>,
  store: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 9l1.2-4.2A1 1 0 0 1 6.2 4h11.6a1 1 0 0 1 1 .8L20 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16M9 20v-5h6v5"/></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7M6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s-6.5-5.5-6.5-10.5A6.5 6.5 0 0 1 18.5 10.5C18.5 15.5 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/></svg>,
  gift: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12h16v8H4zM3 8h18v4H3zM12 8v12M12 8S10.5 4 8.3 4 6 6 8 8M12 8s1.5-4 3.7-4S18 6 16 8"/></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>,
  box: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 8l-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8"/></svg>,
  leaf: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 19c0-8 5-13 14-13 0 9-5 14-14 13ZM5 19c2-5 5-7 9-8"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
};

// ---------- Wordmark ----------
function Logo({ size = 26, color = "var(--noir)", tagline = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, userSelect: "none" }}>
      <span style={{ fontFamily: "var(--f-display)", fontWeight: 300, fontSize: size, letterSpacing: "0.42em",
        color, textTransform: "uppercase", paddingLeft: "0.42em" }}>Emicils</span>
      {tagline && <span style={{ fontFamily: "var(--f-display)", fontSize: size * 0.3, letterSpacing: "0.5em",
        color, opacity: 0.7, textTransform: "uppercase", marginTop: size * 0.28, paddingLeft: "0.5em" }}>Lash Artist</span>}
    </div>
  );
}

// ---------- Étoiles ----------
function Stars({ note, size = 13, showNum = false, count }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ display: "inline-flex", gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <Ico.star key={i} width={size} height={size}
            style={{ color: i <= Math.round(note) ? "var(--or)" : "var(--beige-deep)" }} />
        ))}
      </span>
      {showNum && <span style={{ fontSize: size - 1, color: "var(--texte-doux)" }}>
        {note.toFixed(1)}{count != null && ` · ${count} avis`}
      </span>}
    </span>
  );
}

// ---------- Prix ----------
const euro = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function Price({ value, size = "1rem", color = "var(--noir)" }) {
  return <span style={{ fontFamily: "var(--f-display)", fontWeight: 400, fontSize: size, color, letterSpacing: "0.02em" }}>{euro(value)}</span>;
}

// ---------- Placeholder image produit ----------
const PH_LABELS = {
  cils: "photo · boîte de cils", accessoires: "photo · accessoire",
  soins: "photo · soin", cartes: "visuel · carte",
};
function Photo({ cat, ratio = "1 / 1", label, radius = "var(--r-md)", style }) {
  return (
    <div className="ph" style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      <span>{label || PH_LABELS[cat] || "photo produit"}</span>
    </div>
  );
}

// ---------- Badge ----------
function Badge({ children, tone = "or" }) {
  const tones = {
    or:    { bg: "var(--noir)", c: "var(--blanc)" },
    light: { bg: "var(--blanc)", c: "var(--noir)" },
    soft:  { bg: "var(--or-soft)", c: "var(--or)" },
  };
  const t = tones[tone];
  return <span style={{ background: t.bg, color: t.c, fontFamily: "var(--f-display)", fontSize: "0.6rem",
    letterSpacing: "0.16em", textTransform: "uppercase", padding: "4px 9px", borderRadius: "var(--r-pill)", fontWeight: 400, whiteSpace: "nowrap" }}>{children}</span>;
}

// ---------- Carte produit ----------
function ProductCard({ p, onOpen, onAdd, fav, onFav }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(p)}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ position: "relative" }}>
        <Photo cat={p.cat} radius="var(--r-md)" />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {p.best && <Badge>Best-seller</Badge>}
          {p.nouveau && <Badge tone="soft">Nouveau</Badge>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFav && onFav(p.id); }}
          aria-label="Favori"
          style={{ position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: "50%",
            background: "rgba(251,248,242,0.85)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center",
            color: fav ? "var(--or)" : "var(--texte)", transition: "all .2s" }}>
          <Ico.heart width={17} height={17} style={{ fill: fav ? "var(--or)" : "none" }} />
        </button>
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12,
          opacity: hover ? 1 : 0, transform: hover ? "none" : "translateY(8px)", transition: "all .25s" }}>
          <button className="btn btn-dark btn-block" onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
            <Ico.cart width={15} height={15} /> Ajouter
          </button>
        </div>
        {p.boutique && (
          <div style={{ position: "absolute", left: 12, bottom: 12, opacity: hover ? 0 : 1, transition: "opacity .2s",
            display: "flex", alignItems: "center", gap: 5, background: "rgba(251,248,242,0.85)", backdropFilter: "blur(4px)",
            padding: "4px 9px", borderRadius: "var(--r-pill)", fontSize: "0.62rem", color: "var(--texte)", letterSpacing: "0.04em" }}>
            <Ico.store width={13} height={13} style={{ color: "var(--or)" }} /> Dispo en boutique
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--texte-doux)" }}>{p.line}</span>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 400 }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <Price value={p.price} size="1.05rem" />
          <Stars note={p.note} size={12} />
        </div>
      </div>
    </article>
  );
}

// ---------- En-tête de section ----------
function SectionHead({ eyebrow, title, action, onAction, center }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap",
      gap: "1rem", marginBottom: "2.4rem", textAlign: center ? "center" : "left",
      flexDirection: center ? "column" : "row" }}>
      <div style={{ ...(center ? { margin: "0 auto" } : {}) }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: "0.7rem" }}>{eyebrow}</div>}
        <h2 style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)" }}>{title}</h2>
      </div>
      {action && (
        <button onClick={onAction} style={{ display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "var(--f-display)", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "0.72rem",
          color: "var(--noir)", borderBottom: "1px solid var(--noir)", paddingBottom: 4 }}>
          {action} <Ico.arrow width={15} height={15} />
        </button>
      )}
    </div>
  );
}

// ---------- Sélecteur de quantité ----------
function QtyStepper({ value, onChange, small }) {
  const s = small ? 30 : 38;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--ligne)", borderRadius: "var(--r-sm)", background: "var(--blanc)" }}>
      <button onClick={() => onChange(Math.max(1, value - 1))} style={{ width: s, height: s, display: "grid", placeItems: "center", color: "var(--texte)" }}><Ico.minus width={15} height={15} /></button>
      <span style={{ minWidth: 30, textAlign: "center", fontFamily: "var(--f-display)", fontSize: "0.95rem" }}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={{ width: s, height: s, display: "grid", placeItems: "center", color: "var(--texte)" }}><Ico.plus width={15} height={15} /></button>
    </div>
  );
}

Object.assign(window, { Ico, Logo, Stars, Price, Photo, Badge, ProductCard, SectionHead, QtyStepper, euro });
