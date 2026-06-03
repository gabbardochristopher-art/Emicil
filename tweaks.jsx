// ==========================================================================
// EMICILS — Panneau de réglages (Tweaks)
// ==========================================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "ambiance": "Sable",
  "accent": "#b08d57",
  "titres": "Jost",
  "arrondis": "Doux",
  "densite": "regular"
}/*EDITMODE-END*/;

// Jeux de beige
const AMBIANCES = {
  "Sable":  { bg: "#f4ede2", bg2: "#efe6d8", blanc: "#fbf8f2", soft: "#e9ddca", deep: "#ddcdb2", ligne: "#e3d8c5" },
  "Lin":    { bg: "#f1ece4", bg2: "#eae3d7", blanc: "#faf7f1", soft: "#e6ded0", deep: "#d8cdb9", ligne: "#e0d8ca" },
  "Grège":  { bg: "#efebe4", bg2: "#e6e0d6", blanc: "#f8f6f1", soft: "#e2dccf", deep: "#cfc6b6", ligne: "#ddd6c9" },
  "Rosé":   { bg: "#f5ece6", bg2: "#f0e3da", blanc: "#fcf8f4", soft: "#ecdcd0", deep: "#e0cabb", ligne: "#e7d9cd" },
};
const FONTS = {
  "Jost": "'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  "Cormorant": "'Cormorant', Georgia, serif",
  "Helvetica": "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const ARRONDIS = {
  "Net":     { sm: "0px", md: "0px", lg: "2px" },
  "Doux":    { sm: "4px", md: "8px", lg: "14px" },
  "Arrondi": { sm: "10px", md: "16px", lg: "24px" },
};
const DENSITES = {
  "compact": { gap: "1.1rem", pad: "clamp(2.4rem,5vw,5rem)" },
  "regular": { gap: "1.5rem", pad: "clamp(3rem,7vw,7rem)" },
  "comfy":   { gap: "2rem",   pad: "clamp(4rem,9vw,9rem)" },
};

function applyTweaks(t) {
  const r = document.documentElement.style;
  const a = AMBIANCES[t.ambiance] || AMBIANCES.Sable;
  r.setProperty("--beige-bg", a.bg); r.setProperty("--beige-bg2", a.bg2); r.setProperty("--blanc", a.blanc);
  r.setProperty("--beige-soft", a.soft); r.setProperty("--beige-deep", a.deep); r.setProperty("--ligne", a.ligne);
  r.setProperty("--or", t.accent);
  // accent doux dérivé (teinte claire)
  r.setProperty("--or-soft", t.accent + "26");
  r.setProperty("--f-display", FONTS[t.titres] || FONTS.Jost);
  const ar = ARRONDIS[t.arrondis] || ARRONDIS.Doux;
  r.setProperty("--r-sm", ar.sm); r.setProperty("--r-md", ar.md); r.setProperty("--r-lg", ar.lg);
  const d = DENSITES[t.densite] || DENSITES.regular;
  r.setProperty("--gap", d.gap); r.setProperty("--pad-section", d.pad);
}

function EmicilsTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Couleurs" />
      <TweakRadio label="Ambiance beige" value={t.ambiance} options={["Sable", "Lin", "Grège", "Rosé"]}
        onChange={(v) => setTweak("ambiance", v)} />
      <TweakColor label="Accent doré" value={t.accent}
        options={["#b08d57", "#c39b6a", "#a98c74", "#9c7b4e"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Typographie" />
      <TweakRadio label="Police des titres" value={t.titres} options={["Jost", "Cormorant", "Helvetica"]}
        onChange={(v) => setTweak("titres", v)} />
      <TweakSection label="Mise en forme" />
      <TweakRadio label="Arrondis" value={t.arrondis} options={["Net", "Doux", "Arrondi"]}
        onChange={(v) => setTweak("arrondis", v)} />
      <TweakRadio label="Densité" value={t.densite} options={["compact", "regular", "comfy"]}
        onChange={(v) => setTweak("densite", v)} />
    </TweaksPanel>
  );
}

window.EmicilsTweaks = EmicilsTweaks;
