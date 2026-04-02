import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'chat-academie-fr-v1';
const APPUI_LONG_MS = 3000;

const ONGLETS = [
  { key: 'arithmetique', label: 'arithmétique' },
  { key: 'division', label: 'division' },
  { key: 'logique', label: 'logique' },
  { key: 'raisonnement', label: 'raisonnement' },
  { key: 'trophees', label: 'mes trophées' },
];

const NIVEAUX = [1, 2, 3, 4, 5, 6, 7];
const MOTIVATIONS = ['Bravo !', 'Super fort(e) !', 'Continue comme ça !', 'Tu es une championne !', 'Incroyable !', 'Parfait !'];
const THEMES = ['rose', 'bleu ciel', 'menthe', 'lavande'];
const MOTIFS = ['pattes', 'étoiles', 'cœurs', 'poissons'];

const CHATS = [
  { nom: 'Mimi', seuil: 5, bio: 'Mimi adore les croquettes au saumon !' },
  { nom: 'Caramel', seuil: 10, bio: 'Caramel s’endort dans les cartons.' },
  { nom: 'Noisette', seuil: 20, bio: 'Noisette chasse les papillons imaginaires.' },
  { nom: 'Perle', seuil: 35, bio: 'Perle aime les coussins tout doux.' },
  { nom: 'Luna', seuil: 50, bio: 'Luna regarde les étoiles chaque soir.' },
];

const BADGES = [
  { key: 'premiere_etoile', label: 'Première étoile ⭐' },
  { key: 'serie_5', label: 'Série de 5 🔥' },
  { key: 'serie_10', label: 'Série de 10 💫' },
  { key: 'tables_1_5', label: 'Maître des tables 📊' },
  { key: 'logique_20', label: 'Expert(e) en logique 🧩' },
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const aujourdhui = () => new Date().toISOString().slice(0, 10);

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

function son(type, actif) {
  if (!actif) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;
    const bip = (f, s, d, g) => {
      const o = ctx.createOscillator(); const a = ctx.createGain();
      o.frequency.setValueAtTime(f, s); a.gain.setValueAtTime(g, s);
      a.gain.exponentialRampToValueAtTime(0.0001, s + d);
      o.connect(a).connect(ctx.destination); o.start(s); o.stop(s + d);
    };
    if (type === 'ok') { bip(660, t, 0.12, 0.13); bip(880, t + 0.12, 0.16, 0.13); }
    if (type === 'erreur') { bip(330, t, 0.18, 0.09); bip(280, t + 0.18, 0.2, 0.09); }
    if (type === 'unlock') { bip(523, t, 0.1, 0.12); bip(659, t + 0.1, 0.1, 0.12); bip(784, t + 0.2, 0.18, 0.12); }
    setTimeout(() => ctx.close(), 800);
  } catch {}
}

function optionsDepuisReponse(rep) {
  const n = Number(rep);
  if (!Number.isFinite(n)) return shuffle([String(rep), 'A', 'B', 'C']);
  const s = new Set([String(n)]);
  while (s.size < 4) s.add(String(Math.max(0, n + rand(-10, 10))));
  return shuffle([...s]);
}

function questionArithmetique(niveau, tableFaible) {
  const mode = rand(1, 4);
  const a = rand(10, 80), b = rand(5, 60), c = rand(2, 20);
  if (mode === 1) return { prompt: `${a} + ${b} + ${c} = ?`, answer: String(a + b + c), hint: 'Additionne par étapes.' };
  if (mode === 2) return { prompt: `${a + 20} - ${b} = ?`, answer: String(a + 20 - b), hint: 'Soustrais en deux étapes.' };
  const t = tableFaible || (niveau <= 2 ? rand(1, 5) : niveau <= 5 ? rand(4, 9) : rand(8, 12));
  const m = rand(2, 12), r = t * m;
  if (mode === 3) return { prompt: `${t} × ${m} = ?`, answer: String(r), hint: 'Pense à des additions répétées.' };
  return { prompt: `__ × ${m} = ${r}`, answer: String(t), hint: 'Quel nombre manque ?' };
}

function questionDivision(niveau) {
  const d = niveau <= 2 ? rand(2, 5) : niveau <= 5 ? rand(3, 9) : rand(6, 12);
  const q = rand(2, 12);
  return { prompt: `${d * q} ÷ ${d} = ?`, answer: String(q), hint: 'Utilise la multiplication inverse.' };
}

const LOGIQUE = [
  { prompt: '2, 4, 6, __ ?', answer: '8', hint: 'Ajoute 2 à chaque fois.' },
  { prompt: 'Chat, chien, voiture, lapin : quel intrus ?', answer: 'voiture', hint: 'Trois sont des animaux.' },
  { prompt: 'Léa a 5 pommes, Tom en a 3 de plus. Combien ?', answer: '8', hint: '5 + 3.' },
  { prompt: 'Un chat a 6 pattes. Vrai ou faux ?', answer: 'faux', hint: 'Observe un chat.' },
  { prompt: 'Mini sudoku : 1, 2, _, 4. Que manque-t-il ?', answer: '3', hint: 'Suite de 1 à 4.' },
];

const RAISONNEMENT = [
  { prompt: 'Chaton est à chat ce que chiot est à __ ?', answer: 'chien', hint: 'Bébé du chien.' },
  { prompt: 'Range du plus petit au plus grand : 7, 2, 9, 4', answer: '2,4,7,9', hint: 'Commence par le plus petit.' },
  { prompt: 'Énigme : j’ai des moustaches et je dis miaou. Qui suis-je ?', answer: 'chat', hint: 'Miaou !' },
  { prompt: '3 paniers de 4 poissons, on enlève 2. Combien reste-t-il ?', answer: '10', hint: '3×4 puis -2.' },
  { prompt: 'Lequel vole ?', answer: 'oiseau', hint: 'Animal avec des ailes.' },
];

function barre(pct) { return <div className="barre"><div className="barre-in" style={{ width: `${Math.round(pct)}%` }} /></div>; }

export default function App() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, {
    etoiles: 0, serie: 0, sonActif: true, chatCompagnon: 'Mimi', humeurChat: 'neutre',
    onglet: 'arithmetique', niveau: { arithmetique: 1, division: 1, logique: 1, raisonnement: 1 },
    debloque: { arithmetique: 1, division: 1, logique: 1, raisonnement: 1 },
    progression: { arithmetique: { ok: 0, total: 0 }, division: { ok: 0, total: 0 }, logique: { ok: 0, total: 0 }, raisonnement: { ok: 0, total: 0 } },
    tables: Array(12).fill(false), statsTables: Array.from({ length: 12 }, () => ({ ok: 0, ko: 0 })),
    badges: { premiere_etoile: false, serie_5: false, serie_10: false, tables_1_5: false, logique_20: false },
    logiqueOK: 0, secondesSession: 0, secondesTotal: 0, theme: 'rose', motif: 'pattes',
    tutorielVu: false, dernierJour: '', joursConnexion: [], defiFait: '',
  });

  const [q, setQ] = useState(() => ({ prompt: '8 + 7 = ?', answer: '15', hint: 'Addition simple.' }));
  const [feedback, setFeedback] = useState(null);
  const [bloque, setBloque] = useState(false);
  const [suiteOK, setSuiteOK] = useState(0);
  const [aide, setAide] = useState(false);
  const [pause, setPause] = useState(false);
  const [timerMode, setTimerMode] = useState(false);
  const [temps, setTemps] = useState(60);
  const [scoreTimer, setScoreTimer] = useState(0);
  const [parent, setParent] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const timerPress = useRef(null);

  const onglet = state.onglet;
  const niveau = onglet === 'trophees' ? 1 : state.niveau[onglet];
  const niveauDebloque = onglet === 'trophees' ? 1 : state.debloque[onglet];
  const tableFaible = useMemo(() => state.statsTables.map((s, i) => ({ i: i + 1, r: (s.ok + s.ko) ? s.ko / (s.ok + s.ko) : 0 })).sort((a, b) => b.r - a.r)[0].i, [state.statsTables]);

  const defi = useMemo(() => ({ prompt: `Défi du jour : ${tableFaible} × 2 = ?`, answer: String(tableFaible * 2), options: optionsDepuisReponse(tableFaible * 2) }), [tableFaible]);
  const progressPct = useMemo(() => Object.fromEntries(Object.entries(state.progression).map(([k, v]) => [k, v.total ? (v.ok / v.total) * 100 : 0])), [state.progression]);

  useEffect(() => {
    if (pause || onglet === 'trophees') return;
    const t = setInterval(() => setState((p) => ({ ...p, secondesSession: p.secondesSession + 1, secondesTotal: p.secondesTotal + 1 })), 1000);
    return () => clearInterval(t);
  }, [pause, onglet, setState]);

  useEffect(() => {
    if (!timerMode || pause || temps <= 0) return;
    const t = setTimeout(() => setTemps((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timerMode, temps, pause]);

  useEffect(() => {
    const j = aujourdhui();
    if (state.dernierJour !== j) setState((p) => ({ ...p, etoiles: p.etoiles + 2, dernierJour: j, joursConnexion: [...new Set([...p.joursConnexion, j])] }));
  }, [state.dernierJour, setState]);

  useEffect(() => {
    const base = onglet === 'arithmetique' ? questionArithmetique(niveau, tableFaible) : onglet === 'division' ? questionDivision(niveau) : onglet === 'logique' ? pick(LOGIQUE) : pick(RAISONNEMENT);
    setQ({ ...base, options: base.options || optionsDepuisReponse(base.answer) });
    setFeedback(null); setBloque(false); setSuiteOK(0);
  }, [onglet, niveau, tableFaible]);

  const majBadges = (n) => {
    n.badges.premiere_etoile = n.etoiles > 0;
    n.badges.serie_5 = n.serie >= 5;
    n.badges.serie_10 = n.serie >= 10;
    n.badges.tables_1_5 = n.tables.slice(0, 5).every(Boolean);
    n.badges.logique_20 = n.logiqueOK >= 20;
  };

  const repondre = (r) => {
    if (bloque || pause || onglet === 'trophees' || (timerMode && temps <= 0)) return;
    setBloque(true);
    const ok = String(r).toLowerCase() === String(q.answer).toLowerCase();
    setState((p) => {
      const n = { ...p, progression: { ...p.progression, [onglet]: { ok: p.progression[onglet].ok + (ok ? 1 : 0), total: p.progression[onglet].total + 1 } } };
      if (ok) { n.etoiles += 1; n.serie += 1; n.humeurChat = 'heureux'; if (onglet === 'logique') n.logiqueOK += 1; }
      else { n.serie = 0; n.humeurChat = 'encourageant'; }
      majBadges(n); return n;
    });
    if (ok) {
      son('ok', state.sonActif); setFeedback({ t: 'ok', m: pick(MOTIVATIONS) }); setSuiteOK((v) => v + 1); if (timerMode) setScoreTimer((s) => s + 1);
      if (suiteOK + 1 >= 8 && onglet !== 'trophees') {
        setState((p) => ({ ...p, debloque: { ...p.debloque, [onglet]: Math.min(7, Math.max(p.debloque[onglet], p.niveau[onglet] + 1)) } }));
        son('unlock', state.sonActif); setConfetti(true); setTimeout(() => setConfetti(false), 1100); setSuiteOK(0);
      }
      setTimeout(() => {
        const base = onglet === 'arithmetique' ? questionArithmetique(niveau, tableFaible) : onglet === 'division' ? questionDivision(niveau) : onglet === 'logique' ? pick(LOGIQUE) : pick(RAISONNEMENT);
        setQ({ ...base, options: base.options || optionsDepuisReponse(base.answer) }); setFeedback(null); setBloque(false);
      }, 900);
    } else {
      son('erreur', state.sonActif); setFeedback({ t: 'ko', m: 'Essaie encore, tu peux y arriver !' }); setBloque(false);
    }
  };

  const claim = () => {
    const j = aujourdhui(); if (state.dernierJour === j) return;
    setState((p) => ({ ...p, etoiles: p.etoiles + 2, dernierJour: j, joursConnexion: [...new Set([...p.joursConnexion, j])] }));
  };

  const repondreDefi = (o) => {
    if (state.defiFait === aujourdhui()) return;
    if (String(o) === defi.answer) { setState((p) => ({ ...p, etoiles: p.etoiles + 2, defiFait: aujourdhui() })); setConfetti(true); setTimeout(() => setConfetti(false), 1100); }
  };

  const reset = () => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); };
  const appuiLongDebut = () => { timerPress.current = setTimeout(() => setParent(true), APPUI_LONG_MS); };
  const appuiLongFin = () => clearTimeout(timerPress.current);

  return (
    <AppContext.Provider value={{ ...state }}>
      <div className="app">
        <style>{`*{box-sizing:border-box}body{margin:0;font-family:Nunito,Arial,sans-serif}.app{min-height:100vh;padding:14px 14px 95px;background:#fdf4fb;color:#4c1d59}.carte{background:#fff;border:2px solid #e8b4f0;border-radius:16px;padding:12px}.row{display:flex;gap:8px;flex-wrap:wrap}.barre{height:10px;background:#f1d9f7;border-radius:999px;overflow:hidden}.barre-in{height:100%;background:#a855b5}.opt{min-height:62px;font-size:20px;border:2px solid #e8b4f0;border-radius:12px;background:#fff;cursor:pointer}.grille{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tabbar{position:fixed;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:8px;background:#fff;border-top:2px solid #e8b4f0}.tab{border:none;border-radius:10px;min-height:48px;background:#f1d9f7;cursor:pointer}.tab.actif{background:#a855b5;color:#fff}.pill{border:none;border-radius:10px;background:#f1d9f7;padding:8px 10px;cursor:pointer}.niveaux{display:grid;gap:7px}.niv-row{display:flex}.niv-row.g{justify-content:flex-start}.niv-row.d{justify-content:flex-end}.niv{min-width:120px;border:none;border-radius:999px;background:#f3e6f8;padding:10px 12px;cursor:pointer}.niv.actif{background:#a855b5;color:#fff}.niv.bloque{opacity:.5;cursor:not-allowed}.feedback{margin-top:10px;padding:8px;border-radius:10px}.feedback.ok{background:#ecfdf3}.feedback.ko{background:#fff1f2}.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center}.panel{width:min(700px,92vw);background:#fff;padding:14px;border-radius:14px}.conf{position:fixed;inset:0;pointer-events:none}.conf span{position:absolute;top:-20px;animation:chute 1s linear forwards}@keyframes chute{to{transform:translateY(115vh) rotate(280deg)}}`}</style>

        {confetti && <div className="conf">{Array.from({ length: 20 }).map((_, i) => <span key={i} style={{ left: `${i * 5}%` }}>⭐</span>)}</div>}

        <section className="carte" onMouseDown={appuiLongDebut} onMouseUp={appuiLongFin} onTouchStart={appuiLongDebut} onTouchEnd={appuiLongFin}>
          <h1>mini académie des chats</h1>
          <div className="row"><span>étoiles : {state.etoiles}</span><span>série : {state.serie}</span><span>session : {Math.floor(state.secondesSession / 60)}m {state.secondesSession % 60}s</span></div>
          <div className="row"><button className="pill" onClick={() => setPause((p) => !p)}>{pause ? 'reprendre' : 'pause'}</button><button className="pill" onClick={() => setState((p) => ({ ...p, sonActif: !p.sonActif }))}>{state.sonActif ? 'son activé' : 'son coupé'}</button></div>
          <div>compagnon : {state.chatCompagnon} ({state.humeurChat})</div>
          {Object.keys(progressPct).map((k) => <div key={k}><small>{k} {Math.round(progressPct[k])}%</small>{barre(progressPct[k])}</div>)}
        </section>

        {state.onglet !== 'trophees' && (
          <div className="row" style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <section className="carte"><div className="row"><button className="pill" onClick={() => { setTimerMode((v) => !v); setTemps(60); setScoreTimer(0); }}>{timerMode ? 'arrêter la course' : 'course 60 s'}</button><button className="pill" onClick={() => setAide((v) => !v)}>aide</button>{timerMode && <span>temps : {temps}s | score : {scoreTimer}</span>}</div><p>révision intelligente : veux-tu revoir la table de {tableFaible} ?</p></section>
            <section className="carte niveaux">{NIVEAUX.map((n, i) => <div className={`niv-row ${i % 2 === 0 ? 'g' : 'd'}`} key={n}><button className={`niv ${niveau === n ? 'actif' : ''} ${n > niveauDebloque ? 'bloque' : ''}`} disabled={n > niveauDebloque} onClick={() => setState((p) => ({ ...p, niveau: { ...p.niveau, [onglet]: n } }))}>niveau {n}</button></div>)}</section>
            <section className="carte"><p style={{ fontSize: 18 }}>{q.prompt}</p><div className="grille">{q.options.map((o) => <button className="opt" disabled={bloque || (timerMode && temps <= 0)} key={o} onClick={() => repondre(o)}>{o}</button>)}</div>{aide && <p>indice : {q.hint}</p>}{feedback && <p className={`feedback ${feedback.t}`}>{feedback.m}</p>}</section>
            <section className="carte"><p>progression du niveau : {suiteOK}/8</p>{barre((suiteOK / 8) * 100)}</section>
            <section className="carte"><h3>récompenses quotidiennes</h3><button className="pill" onClick={claim}>{state.dernierJour === aujourdhui() ? 'déjà récupéré aujourd’hui' : 'récupérer +2 étoiles'}</button><p>{defi.prompt}</p><div className="row">{defi.options.map((o) => <button className="pill" key={o} onClick={() => repondreDefi(o)} disabled={state.defiFait === aujourdhui()}>{o}</button>)}</div><div className="row">{state.joursConnexion.slice(-14).map((j) => <span key={j}>🐾 {j.slice(8)}</span>)}</div></section>
            <section className="carte"><h3>personnalisation</h3><div className="row">{THEMES.map((t) => <button className="pill" key={t} onClick={() => setState((p) => ({ ...p, theme: t }))}>{t}</button>)}</div><div className="row">{MOTIFS.map((m) => <button className="pill" key={m} onClick={() => setState((p) => ({ ...p, motif: m }))}>{m}</button>)}</div></section>
            <section className="carte"><h3>chats débloqués</h3><div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{CHATS.map((c) => <button key={c.nom} className="pill" disabled={state.etoiles < c.seuil} onClick={() => setState((p) => ({ ...p, chatCompagnon: c.nom }))}><strong>{c.nom}</strong><br />{c.seuil} étoiles<br />{c.bio}</button>)}</div></section>
          </div>
        )}

        {state.onglet === 'trophees' && <section className="carte" style={{ marginTop: 10 }}><h3>mes trophées</h3><p>logique réussie : {state.logiqueOK}/20</p><div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{BADGES.map((b) => <div key={b.key} className="carte" style={{ opacity: state.badges[b.key] ? 1 : 0.5 }}><strong>{b.label}</strong></div>)}</div></section>}

        {parent && <div className="overlay" onClick={() => setParent(false)}><div className="panel" onClick={(e) => e.stopPropagation()}><h3>tableau de bord parental</h3><p>temps total : {Math.floor(state.secondesTotal / 60)} min</p><p>module préféré : {Object.entries(state.progression).sort((a, b) => b[1].total - a[1].total)[0]?.[0]}</p><p>taux global : {Math.round((Object.values(state.progression).reduce((s, x) => s + x.ok, 0) / Math.max(1, Object.values(state.progression).reduce((s, x) => s + x.total, 0))) * 100)}%</p><button className="pill" onClick={reset}>réinitialiser la progression</button></div></div>}

        <nav className="tabbar">{ONGLETS.map((o) => <button key={o.key} className={`tab ${state.onglet === o.key ? 'actif' : ''}`} onClick={() => setState((p) => ({ ...p, onglet: o.key }))}>{o.label}</button>)}</nav>
      </div>
    </AppContext.Provider>
  );
}

