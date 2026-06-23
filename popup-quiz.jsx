// ==========================================================================
// EMICILS — Popup Quiz (affiché une seule fois par visiteur)
// ==========================================================================

function PopupQuiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ style: '', experience: '', objectif: '' });
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function select(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (step < 3) setTimeout(() => setStep(s => s + 1), 250);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim()) {
      setError('Veuillez remplir au moins votre nom, prénom et email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Adresse email invalide.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/popup-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur');
      }
      setDone(true);
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSending(false);
    }
  }

  const questions = [
    {
      title: 'Quel style de cils vous attire le plus ?',
      key: 'style',
      options: [
        { label: 'Volume Russe', icon: '✨' },
        { label: 'Classique', icon: '🌸' },
        { label: 'Mixte (hybride)', icon: '💫' },
        { label: 'Mega Volume', icon: '🔥' },
      ],
    },
    {
      title: 'Quel est votre niveau d\'expérience ?',
      key: 'experience',
      options: [
        { label: 'Débutante — je découvre', icon: '🌱' },
        { label: 'Intermédiaire — j\'en porte parfois', icon: '💅' },
        { label: 'Experte — j\'en porte tout le temps', icon: '👑' },
      ],
    },
    {
      title: 'Quel est votre objectif principal ?',
      key: 'objectif',
      options: [
        { label: 'Un regard naturel au quotidien', icon: '🌿' },
        { label: 'Un effet glamour pour les occasions', icon: '💎' },
        { label: 'Un look intense en permanence', icon: '🖤' },
        { label: 'Me former / devenir lash artist', icon: '🎓' },
      ],
    },
  ];

  const progressPct = done ? 100 : ((step + (step >= 3 ? 1 : 0)) / 4) * 100;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(29,26,22,0.55)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      animation: 'popupFadeIn .3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--beige-bg)', borderRadius: 16, width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 30px 80px -20px rgba(29,26,22,0.5)',
        animation: 'popupSlideUp .35s ease',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--noir)', color: 'var(--blanc)', padding: '22px 24px 18px',
          position: 'relative', textAlign: 'center',
        }}>
          <button onClick={onClose} aria-label="Fermer" style={{
            position: 'absolute', top: 14, right: 16, color: 'rgba(251,248,242,0.6)',
            fontSize: '1.2rem', lineHeight: 1,
          }}>✕</button>
          <div style={{
            fontFamily: 'var(--f-display)', fontSize: '0.68rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--or)', marginBottom: 6,
          }}>Emicils</div>
          <div style={{
            fontFamily: 'var(--f-serif)', fontSize: '1.35rem', fontWeight: 400, fontStyle: 'italic',
          }}>
            {done ? 'Merci !' : step < 3 ? 'Trouvez votre style' : 'Vos coordonnées'}
          </div>
          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'rgba(251,248,242,0.1)',
          }}>
            <div style={{
              height: '100%', background: 'var(--or)',
              width: `${progressPct}%`, transition: 'width .4s ease',
            }} />
          </div>
        </div>

        <div style={{ padding: '24px 24px 28px', overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>
          {/* Ecran de fin */}
          {done && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🎉</div>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.05rem', color: 'var(--noir)', marginBottom: 8 }}>
                Merci pour vos réponses !
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--texte-doux)' }}>
                Nous vous recontacterons très bientôt.
              </p>
            </div>
          )}

          {/* Questions quiz */}
          {!done && step < 3 && (
            <div key={step} style={{ animation: 'popupFadeIn .25s ease' }}>
              <p style={{
                fontFamily: 'var(--f-display)', fontSize: '1rem', color: 'var(--noir)',
                marginBottom: 18, textAlign: 'center',
              }}>
                {questions[step].title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions[step].options.map(opt => {
                  const selected = answers[questions[step].key] === opt.label;
                  return (
                    <button key={opt.label} onClick={() => select(questions[step].key, opt.label)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                        borderRadius: 10, border: '1.5px solid',
                        borderColor: selected ? 'var(--or)' : 'var(--ligne)',
                        background: selected ? 'var(--or-soft)' : 'var(--blanc)',
                        transition: 'all .2s', textAlign: 'left',
                      }}>
                      <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                      <span style={{
                        fontFamily: 'var(--f-display)', fontSize: '0.88rem', color: 'var(--noir)',
                        letterSpacing: '0.02em',
                      }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                    background: i <= step ? 'var(--or)' : 'var(--beige-deep)',
                    transition: 'all .3s',
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Formulaire contact */}
          {!done && step >= 3 && (
            <form onSubmit={submit} style={{ animation: 'popupFadeIn .25s ease' }}>
              <p style={{
                fontSize: '0.86rem', color: 'var(--texte-doux)', marginBottom: 18, textAlign: 'center',
              }}>
                Laissez-nous vos coordonnées pour recevoir des conseils personnalisés.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    style={inputStyle} placeholder="Marie" />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    style={inputStyle} placeholder="Dupont" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Téléphone</label>
                <input value={form.telephone} onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, telephone: digits }));
                  }}
                  style={inputStyle} placeholder="0612345678" type="tel" maxLength={10} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Email *</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle} placeholder="marie@exemple.fr" type="email" />
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: '0.82rem', marginTop: 10 }}>{error}</p>}
              <button type="submit" disabled={sending} className="btn btn-dark btn-block"
                style={{ marginTop: 20, padding: '0.9em 1.6em', fontSize: '0.82rem' }}>
                {sending ? 'Envoi en cours…' : 'Recevoir mes conseils'}
              </button>
              <button type="button" onClick={() => setStep(2)}
                style={{ display: 'block', margin: '12px auto 0', fontSize: '0.78rem', color: 'var(--texte-doux)' }}>
                ← Retour
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes popupFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popupSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontFamily: 'var(--f-display)', fontSize: '0.72rem',
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--texte-doux)',
  marginBottom: 5,
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--ligne)', background: 'var(--blanc)',
  fontSize: '0.9rem', fontFamily: 'var(--f-body)', color: 'var(--noir)',
  outline: 'none',
};

function PopupQuizWrapper() {
  const [visible, setVisible] = useState(true);

  function handleClose() {
    setVisible(false);
  }

  if (!visible) return null;
  return <PopupQuiz onClose={handleClose} />;
}
