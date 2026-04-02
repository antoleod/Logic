import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'chat-academy-v3';
const LONG_PRESS_MS = 3000;

const MODULES = [
  { key: 'aritmetica', label: 'aritmetica' },
  { key: 'division', label: 'division' },
  { key: 'logica', label: 'logica' },
  { key: 'razonamiento', label: 'razonamiento' },
  { key: 'trofeos', label: 'mes trophees' },
];

const LEVELS = [1, 2, 3, 4, 5, 6, 7];

const CATS = [
  { name: 'Mimi', stars: 5, bio: 'Mimi adore les croquettes au saumon.' },
  { name: 'Caramel', stars: 10, bio: 'Caramel dort dans des boites en carton.' },
  { name: 'Noisette', stars: 20, bio: 'Noisette chasse les papillons imaginaires.' },
  { name: 'Perle', stars: 35, bio: 'Perle aime les coussins tres moelleux.' },
  { name: 'Luna', stars: 50, bio: 'Luna regarde les etoiles chaque soir.' },
];

const BADGE_KEYS = {
  firstStar: 'premiere_etoile',
  streak5: 'serie_5',
  streak10: 'serie_10',
  tables15: 'maitre_tables_1_5',
  logic20: 'expert_logique_20',
};

const BADGES = [
  { key: BADGE_KEYS.firstStar, label: 'premiere etoile', desc: 'premiere bonne reponse' },
  { key: BADGE_KEYS.streak5, label: 'serie de 5', desc: '5 bonnes reponses consecutives' },
  { key: BADGE_KEYS.streak10, label: 'serie de 10', desc: '10 bonnes reponses consecutives' },
  { key: BADGE_KEYS.tables15, label: 'maitre des tables', desc: 'tables 1 a 5 maitrisees' },
  { key: BADGE_KEYS.logic20, label: 'expert en logique', desc: '20 exercices de logique reussis' },
];

const MOTIVATIONS = ['bravo', 'super fort', 'continue comme ca', 'tu es une championne', 'incroyable', 'parfait'];

const THEMES = {
  rose: { bg: '#fdf4fb', card: '#fffdfd', accent: '#a855b5', soft: '#e8b4f0', text: '#4c1d59' },
  ciel: { bg: '#eff8ff', card: '#ffffff', accent: '#3b82f6', soft: '#bfdbfe', text: '#1e3a8a' },
  menthe: { bg: '#ecfdf5', card: '#ffffff', accent: '#10b981', soft: '#a7f3d0', text: '#065f46' },
  lavande: { bg: '#f5f3ff', card: '#ffffff', accent: '#7c3aed', soft: '#ddd6fe', text: '#4c1d95' },
};

const PATTERNS = ['pattes', 'etoiles', 'coeurs', 'poissons'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const todayKey = () => new Date().toISOString().slice(0, 10);

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
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState];
}

function playSound(type, enabled) {
  if (!enabled) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const tone = (freq, start, dur, gain) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(gain, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };
    if (type === 'ok') {
      tone(660, now, 0.14, 0.14);
      tone(880, now + 0.14, 0.16, 0.14);
    } else if (type === 'bad') {
      tone(330, now, 0.18, 0.09);
      tone(280, now + 0.18, 0.22, 0.09);
    } else if (type === 'unlock') {
      tone(523, now, 0.12, 0.12);
      tone(659, now + 0.1, 0.12, 0.12);
      tone(784, now + 0.2, 0.18, 0.12);
    }
    setTimeout(() => ctx.close(), 900);
  } catch {
    // ignore
  }
}

function makeOptions(answer) {
  const base = Number(answer);
  if (!Number.isFinite(base)) return shuffle([String(answer), 'a', 'b', 'c']);
  const set = new Set([String(base)]);
  while (set.size < 4) set.add(String(Math.max(0, base + rand(-12, 12))));
  return shuffle([...set]);
}

function rangeByLevel(level) {
  if (level <= 2) return [1, 12];
  if (level <= 5) return [6, 35];
  return [18, 90];
}

function genArithmetic(level, weakTable) {
  const [min, max] = rangeByLevel(level);
  const mode = rand(1, 4);
  if (mode === 1) {
    const a = rand(min, max);
    const b = rand(min, max);
    const c = rand(2, 20);
    const ans = a + b + c;
    return { prompt: `${a} + ${b} + ${c} = ?`, answer: String(ans), options: makeOptions(ans), hint: 'suma por partes' };
  }
  if (mode === 2) {
    const a = rand(min + 15, max + 25);
    const b = rand(min, Math.min(max, a - 1));
    const ans = a - b;
    return { prompt: `${a} - ${b} = ?`, answer: String(ans), options: makeOptions(ans), hint: 'resta en dos pasos' };
  }
  const m1 = weakTable || (level <= 2 ? rand(1, 5) : level <= 5 ? rand(4, 9) : rand(8, 12));
  const m2 = rand(2, 12);
  const ans = m1 * m2;
  if (mode === 3) return { prompt: `${m1} x ${m2} = ?`, answer: String(ans), options: makeOptions(ans), hint: 'repite sumas iguales' };
  return { prompt: `__ x ${m2} = ${ans}`, answer: String(m1), options: makeOptions(m1), hint: 'que numero falta?' };
}

function genDivision(level) {
  const div = level <= 2 ? rand(2, 5) : level <= 5 ? rand(3, 9) : rand(6, 12);
  const q = rand(2, 12);
  return { prompt: `${div * q} / ${div} = ?`, answer: String(q), options: makeOptions(q), hint: 'piensa en multiplicacion inversa' };
}

const LOGIC_BANK = [
  { prompt: '2, 4, 6, __ ?', answer: '8', options: ['7', '8', '9', '10'], hint: 'aumenta de 2 en 2' },
  { prompt: 'chat, chien, voiture, lapin: lequel nest pas animal?', answer: 'voiture', options: ['chat', 'chien', 'voiture', 'lapin'], hint: 'trois sont animaux' },
  { prompt: 'lea a 5 pommes, tom en a 3 de plus. combien?', answer: '8', options: ['7', '8', '9', '10'], hint: 'additionne 3 a 5' },
  { prompt: 'un chat a 6 pattes. vrai ou faux?', answer: 'faux', options: ['vrai', 'faux', 'parfois', 'jamais'], hint: 'compte les pattes d un chat' },
  { prompt: '5, 10, 15, __ ?', answer: '20', options: ['18', '19', '20', '22'], hint: 'de 5 en 5' },
  { prompt: 'sudoku mini: dans 1 2 _ 4, quel chiffre manque?', answer: '3', options: ['1', '2', '3', '4'], hint: 'sequence 1 2 3 4' },
  { prompt: 'labyrinthe texte: va a droite puis en haut. ou arrives-tu?', answer: 'sortie', options: ['mur', 'depart', 'sortie', 'coin'], hint: 'suis les etapes' },
];

const REASON_BANK = [
  { prompt: 'chaton est a chat ce que chiot est a __ ?', answer: 'chien', options: ['poisson', 'chien', 'oiseau', 'lapin'], hint: 'bebe de chien' },
  { prompt: 'range du plus petit au plus grand: 7,2,9,4', answer: '2,4,7,9', options: ['2,4,7,9', '9,7,4,2', '2,7,4,9', '4,2,7,9'], hint: 'cherche le minimum' },
  { prompt: 'enigme: jai des moustaches et je dis miaou. qui suis-je?', answer: 'chat', options: ['chien', 'chat', 'poisson', 'lapin'], hint: 'miaou' },
  { prompt: 'memoire: sequence 2-5-2. quel est le dernier?', answer: '2', options: ['2', '3', '4', '5'], hint: 'repete dans la tete' },
  { prompt: '3 paniers, 4 poissons chacun, on enleve 2. combien reste?', answer: '10', options: ['9', '10', '11', '12'], hint: '3x4 puis -2' },
  { prompt: 'lequel vole?', answer: 'oiseau', options: ['chien', 'oiseau', 'chat', 'poisson'], hint: 'animal qui a des ailes' },
];

function genLogic() {
  return pick(LOGIC_BANK);
}

function genReasoning() {
  return pick(REASON_BANK);
}

function ProgressBar({ value }) {
  return <div className="progress-wrap"><div className="progress-fill" style={{ width: `${Math.round(value)}%` }} /></div>;
}

function Confetti({ active }) {
  if (!active) return null;
  return <div className="confetti-layer">{Array.from({ length: 16 }).map((_, i) => <span key={i} style={{ left: `${6 * i}%`, animationDelay: `${i * 0.05}s` }}>*</span>)}</div>;
}

function Header({ progress, onLongPressStart, onLongPressEnd, sessionSeconds, isPaused, togglePause, soundOn, toggleSound }) {
  const { stars, streak, companionMood, companionCat } = useContext(AppContext);
  return (
    <header className="header" onMouseDown={onLongPressStart} onMouseUp={onLongPressEnd} onTouchStart={onLongPressStart} onTouchEnd={onLongPressEnd}>
      <h1>mini academie des chats</h1>
      <div className="stats-row"><span>etoiles: {stars}</span><span>serie: {streak}</span><span>session: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s</span></div>
      <div className="stats-row"><button className="ghost" onClick={togglePause}>{isPaused ? 'reprendre' : 'pause'}</button><button className="ghost" onClick={toggleSound}>{soundOn ? 'son actif' : 'son coupe'}</button></div>
      <div className="companion">compagnon: {companionCat} ({companionMood})</div>
      <div className="progress-grid">{Object.keys(progress).map((k) => <div key={k}><small>{k} {Math.round(progress[k])}%</small><ProgressBar value={progress[k]} /></div>)}</div>
    </header>
  );
}

function TabBar({ tab, setTab }) {
  return <nav className="tabbar">{MODULES.map((m) => <button key={m.key} className={`tab ${tab === m.key ? 'active' : ''}`} onClick={() => setTab(m.key)}>{m.label}</button>)}</nav>;
}

function LevelPath({ selected, unlocked, onSelect }) {
  return (
    <section className="path">
      {LEVELS.map((id, idx) => {
        const locked = id > unlocked;
        return <div className={`path-row ${idx % 2 === 0 ? 'left' : 'right'}`} key={id}><button className={`node ${selected === id ? 'active' : ''} ${locked ? 'locked' : ''}`} disabled={locked} onClick={() => onSelect(id)}>niveau {id}</button></div>;
      })}
    </section>
  );
}

function QuestionCard({ question, onAnswer, feedback, disabled, showHint }) {
  return (
    <section className="card fade-in">
      <p className="q-text">{question.prompt}</p>
      <div className="opt-grid">{question.options.map((o) => <button className="option" disabled={disabled} key={o} onClick={() => onAnswer(o)}>{o}</button>)}</div>
      {showHint && <p className="hint">indice: {question.hint || 'observe bien la question'}</p>}
      {feedback && <p className={`feedback ${feedback.type}`}>{feedback.text}</p>}
    </section>
  );
}

function CatGallery({ companion, setCompanion }) {
  const { stars } = useContext(AppContext);
  return (
    <section className="card">
      <h3>chats debloques</h3>
      <div className="cats-grid">
        {CATS.map((c) => {
          const unlocked = stars >= c.stars;
          return <button key={c.name} disabled={!unlocked} className={`cat ${unlocked ? 'on' : 'off'} ${companion === c.name ? 'sel' : ''}`} onClick={() => unlocked && setCompanion(c.name)}><strong>{c.name}</strong><small>{c.stars} etoiles</small><small>{c.bio}</small></button>;
        })}
      </div>
    </section>
  );
}

function TrophyTab({ badges, logicSuccess }) {
  return (
    <section className="card">
      <h3>mes trophees</h3>
      <p>logique reussie: {logicSuccess}/20</p>
      <div className="badge-grid">{BADGES.map((b) => <div key={b.key} className={`badge ${badges[b.key] ? 'on' : 'off'}`}><strong>{b.label}</strong><small>{b.desc}</small></div>)}</div>
    </section>
  );
}

function ParentDashboard({ open, onClose, stats, onReset }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <h3>tableau de bord parental</h3>
        <p>temps total: {Math.floor(stats.totalSeconds / 60)} min</p>
        <p>module prefere: {stats.favoriteModule}</p>
        <p>taux reussite global: {Math.round(stats.successRate)}%</p>
        <h4>evolution semaine</h4>
        <div className="week-chart">{stats.week.map((d) => <div key={d.day} className="bar-col"><span style={{ height: `${d.rate}%` }} /><small>{d.day.slice(5)}</small></div>)}</div>
        <button className="danger" onClick={onReset}>reinitialiser progression</button>
        <button className="ghost" onClick={onClose}>fermer</button>
      </div>
    </div>
  );
}

function ThemePanel({ theme, pattern, setTheme, setPattern }) {
  return (
    <section className="card">
      <h3>personnalisation</h3>
      <div className="stats-row">{Object.keys(THEMES).map((k) => <button key={k} className={`pill ${theme === k ? 'active' : ''}`} onClick={() => setTheme(k)}>{k}</button>)}</div>
      <div className="stats-row">{PATTERNS.map((p) => <button key={p} className={`pill ${pattern === p ? 'active' : ''}`} onClick={() => setPattern(p)}>{p}</button>)}</div>
    </section>
  );
}

function DailyPanel({ daily, claimDaily, challenge, onChallengeAnswer }) {
  return (
    <section className="card">
      <h3>recompenses quotidiennes</h3>
      <button className="pill" disabled={!daily.canClaim} onClick={claimDaily}>{daily.canClaim ? 'recuperer +2 etoiles' : 'deja recupere aujourd hui'}</button>
      <p>defi du jour (x2 etoiles)</p>
      <p>{challenge.prompt}</p>
      <div className="stats-row">{challenge.options.map((o) => <button key={o} className="pill" onClick={() => onChallengeAnswer(o)} disabled={daily.challengeDone}>{o}</button>)}</div>
      <div className="calendar">{daily.days.map((d) => <span key={d} className="paw">{d.slice(8)}</span>)}</div>
    </section>
  );
}

function createInitialState() {
  return {
    stars: 0,
    streak: 0,
    soundOn: true,
    companionCat: 'Mimi',
    companionMood: 'neutre',
    tablesMastered: Array(12).fill(false),
    tableStats: Array.from({ length: 12 }, () => ({ ok: 0, bad: 0 })),
    selectedLevel: { aritmetica: 1, division: 1, logica: 1, razonamiento: 1 },
    unlockedLevel: { aritmetica: 1, division: 1, logica: 1, razonamiento: 1 },
    progress: { aritmetica: { ok: 0, total: 0 }, division: { ok: 0, total: 0 }, logica: { ok: 0, total: 0 }, razonamiento: { ok: 0, total: 0 } },
    badges: { [BADGE_KEYS.firstStar]: false, [BADGE_KEYS.streak5]: false, [BADGE_KEYS.streak10]: false, [BADGE_KEYS.tables15]: false, [BADGE_KEYS.logic20]: false },
    logicSuccess: 0,
    sessionSeconds: 0,
    totalSeconds: 0,
    moduleTime: { aritmetica: 0, division: 0, logica: 0, razonamiento: 0 },
    dayHistory: [],
    theme: 'rose',
    pattern: 'pattes',
    tutorialSeen: false,
    lastLogin: '',
    loginDays: [],
    challengeDoneDate: '',
  };
}

export default function App() {
  const [store, setStore] = useLocalStorage(STORAGE_KEY, createInitialState());
  const [tab, setTab] = useState('aritmetica');
  const [question, setQuestion] = useState(() => genArithmetic(1, null));
  const [feedback, setFeedback] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [goodLevel, setGoodLevel] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [showParent, setShowParent] = useState(false);
  const [showTutorial, setShowTutorial] = useState(!store.tutorialSeen);
  const [confetti, setConfetti] = useState(false);
  const [timerMode, setTimerMode] = useState(false);
  const [timerLeft, setTimerLeft] = useState(60);
  const [timerScore, setTimerScore] = useState(0);
  const pressTimerRef = useRef(null);

  const selectedLevel = tab === 'trofeos' ? 1 : store.selectedLevel[tab] || 1;
  const unlockedLevel = tab === 'trofeos' ? 1 : store.unlockedLevel[tab] || 1;

  const weakTable = useMemo(() => {
    let worst = 1;
    let worstRate = -1;
    store.tableStats.forEach((t, i) => {
      const total = t.ok + t.bad;
      const rate = total === 0 ? 0 : t.bad / total;
      if (rate > worstRate) {
        worstRate = rate;
        worst = i + 1;
      }
    });
    return worst;
  }, [store.tableStats]);

  const challenge = useMemo(() => ({ prompt: `defi du jour: ${weakTable} x 2 = ?`, answer: String(weakTable * 2), options: makeOptions(weakTable * 2) }), [weakTable]);

  useEffect(() => {
    const key = todayKey();
    if (store.lastLogin !== key) {
      setStore((p) => ({ ...p, stars: p.stars + 2, lastLogin: key, loginDays: [...new Set([...p.loginDays, key])] }));
    }
  }, [store.lastLogin, setStore]);

  useEffect(() => {
    if (isPaused || tab === 'trofeos') return;
    const t = setInterval(() => {
      setStore((p) => ({ ...p, sessionSeconds: p.sessionSeconds + 1, totalSeconds: p.totalSeconds + 1, moduleTime: { ...p.moduleTime, [tab]: (p.moduleTime[tab] || 0) + 1 } }));
    }, 1000);
    return () => clearInterval(t);
  }, [tab, isPaused, setStore]);

  useEffect(() => {
    if (!timerMode || isPaused || timerLeft <= 0) return;
    const t = setTimeout(() => setTimerLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerMode, timerLeft, isPaused]);

  useEffect(() => {
    const q = tab === 'aritmetica' ? genArithmetic(selectedLevel, weakTable) : tab === 'division' ? genDivision(selectedLevel) : tab === 'logica' ? genLogic() : genReasoning();
    setQuestion(q);
    setFeedback(null);
    setDisabled(false);
    setGoodLevel(0);
  }, [tab, selectedLevel, weakTable]);

  const progressPct = useMemo(() => {
    const out = {};
    Object.keys(store.progress).forEach((k) => {
      const p = store.progress[k];
      out[k] = p.total ? (p.ok / p.total) * 100 : 0;
    });
    return out;
  }, [store.progress]);

  const ctx = useMemo(() => ({ stars: store.stars, streak: store.streak, companionCat: store.companionCat, companionMood: store.companionMood }), [store.stars, store.streak, store.companionCat, store.companionMood]);

  const updateBadges = useCallback((next) => {
    const b = { ...next.badges };
    if (next.stars > 0) b[BADGE_KEYS.firstStar] = true;
    if (next.streak >= 5) b[BADGE_KEYS.streak5] = true;
    if (next.streak >= 10) b[BADGE_KEYS.streak10] = true;
    if (next.tablesMastered.slice(0, 5).every(Boolean)) b[BADGE_KEYS.tables15] = true;
    if (next.logicSuccess >= 20) b[BADGE_KEYS.logic20] = true;
    return { ...next, badges: b };
  }, []);

  const spawnConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1200);
  };

  const setQuestionForCurrent = useCallback(() => {
    const q = tab === 'aritmetica' ? genArithmetic(selectedLevel, weakTable) : tab === 'division' ? genDivision(selectedLevel) : tab === 'logica' ? genLogic() : genReasoning();
    setQuestion(q);
    setFeedback(null);
    setDisabled(false);
  }, [tab, selectedLevel, weakTable]);

  const answer = (opt) => {
    if (disabled || isPaused || tab === 'trofeos' || (timerMode && timerLeft <= 0)) return;
    setDisabled(true);
    const ok = String(opt).toLowerCase() === String(question.answer).toLowerCase();
    setStore((prev) => {
      const next = { ...prev, progress: { ...prev.progress, [tab]: { ok: prev.progress[tab].ok + (ok ? 1 : 0), total: prev.progress[tab].total + 1 } } };
      if (ok) {
        next.stars += 1;
        next.streak += 1;
        next.companionMood = 'heureux';
        if (tab === 'logica') next.logicSuccess += 1;
        if (tab === 'aritmetica' && question.prompt.includes('x')) {
          const raw = question.prompt.startsWith('__') ? question.answer : question.prompt.split(' x ')[0];
          const table = Number(raw);
          if (table >= 1 && table <= 12) {
            next.tableStats[table - 1].ok += 1;
            next.tablesMastered[table - 1] = next.tableStats[table - 1].ok >= 3;
          }
        }
      } else {
        next.streak = 0;
        next.companionMood = 'encourageant';
        if (tab === 'aritmetica' && question.prompt.includes('x') && !question.prompt.startsWith('__')) {
          const table = Number(question.prompt.split(' x ')[0]);
          if (table >= 1 && table <= 12) next.tableStats[table - 1].bad += 1;
        }
      }
      return updateBadges(next);
    });

    if (ok) {
      playSound('ok', store.soundOn);
      const nextGood = goodLevel + 1;
      setGoodLevel(nextGood);
      setFeedback({ type: 'ok', text: pick(MOTIVATIONS) });
      if (timerMode) setTimerScore((s) => s + 1);
      if (nextGood >= 8 && tab !== 'trofeos') {
        const before = unlockedLevel;
        const after = Math.min(7, Math.max(unlockedLevel, selectedLevel + 1));
        setStore((p) => ({ ...p, unlockedLevel: { ...p.unlockedLevel, [tab]: after } }));
        setGoodLevel(0);
        if (after > before) {
          playSound('unlock', store.soundOn);
          spawnConfetti();
        }
      }
      if (store.streak + 1 === 10) spawnConfetti();
      setTimeout(setQuestionForCurrent, 900);
    } else {
      playSound('bad', store.soundOn);
      setFeedback({ type: 'bad', text: 'essaie encore, tu peux y arriver' });
      setDisabled(false);
    }
  };

  const daily = { canClaim: store.lastLogin !== todayKey(), days: store.loginDays.slice(-14), challengeDone: store.challengeDoneDate === todayKey() };

  const claimDaily = () => {
    if (!daily.canClaim) return;
    setStore((p) => ({ ...p, stars: p.stars + 2, lastLogin: todayKey(), loginDays: [...new Set([...p.loginDays, todayKey()])] }));
  };

  const onChallengeAnswer = (opt) => {
    if (daily.challengeDone) return;
    if (String(opt) === challenge.answer) {
      setStore((p) => updateBadges({ ...p, stars: p.stars + 2, challengeDoneDate: todayKey() }));
      spawnConfetti();
    } else setFeedback({ type: 'bad', text: 'pas encore, essaie le defi encore' });
  };

  const parentStats = useMemo(() => {
    const totalAttempts = Object.values(store.progress).reduce((a, p) => a + p.total, 0);
    const totalOk = Object.values(store.progress).reduce((a, p) => a + p.ok, 0);
    const favoriteModule = Object.entries(store.moduleTime).sort((a, b) => b[1] - a[1])[0]?.[0] || 'aucun';
    const week = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const logs = store.dayHistory.filter((h) => h.day === key);
      const ok = logs.reduce((s, x) => s + x.ok, 0);
      const total = logs.reduce((s, x) => s + x.total, 0);
      return { day: key, rate: total ? (ok / total) * 100 : 0 };
    });
    return { totalSeconds: store.totalSeconds, favoriteModule, successRate: totalAttempts ? (totalOk / totalAttempts) * 100 : 0, week };
  }, [store]);

  const onLongPressStart = () => {
    pressTimerRef.current = setTimeout(() => setShowParent(true), LONG_PRESS_MS);
  };
  const onLongPressEnd = () => clearTimeout(pressTimerRef.current);
  const resetAll = () => {
    setStore(createInitialState());
    setShowParent(false);
  };

  const theme = THEMES[store.theme] || THEMES.rose;
  const patternCss = store.pattern === 'etoiles' ? 'radial-gradient(circle at 20px 20px, rgba(255,255,255,.45) 0 2px, transparent 3px)' : store.pattern === 'coeurs' ? 'radial-gradient(circle at 20px 20px, rgba(255,255,255,.4) 0 4px, transparent 5px)' : store.pattern === 'poissons' ? 'radial-gradient(circle at 18px 18px, rgba(255,255,255,.35) 0 3px, transparent 4px)' : 'radial-gradient(circle at 20px 20px, rgba(255,255,255,.35) 0 5px, transparent 6px)';

  return (
    <AppContext.Provider value={ctx}>
      <div className="app" style={{ '--bg': theme.bg, '--card': theme.card, '--accent': theme.accent, '--soft': theme.soft, '--text': theme.text, '--pattern': patternCss }}>
        <style>{`*{box-sizing:border-box}body{margin:0;font-family:Nunito,Arial,sans-serif;background:var(--bg);color:var(--text)}.app{min-height:100vh;padding:14px 14px 96px;background:var(--pattern),var(--bg)}.header,.card{background:var(--card);border:2px solid var(--soft);border-radius:16px;padding:12px}.header h1{margin:0 0 8px;font-size:24px}.stats-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:16px}.ghost,.pill,.option,.node,.tab,.cat,.danger{cursor:pointer;font-family:inherit;border:none}.ghost,.pill{background:var(--soft);color:var(--text);border-radius:10px;padding:8px 10px}.pill.active{background:var(--accent);color:#fff}.progress-grid{display:grid;gap:8px}.progress-wrap{height:10px;border-radius:999px;overflow:hidden;background:color-mix(in srgb,var(--soft) 70%,white)}.progress-fill{height:100%;background:var(--accent)}.path{margin-top:10px;display:grid;gap:7px}.path-row{display:flex}.path-row.left{justify-content:flex-start}.path-row.right{justify-content:flex-end}.node{min-width:120px;background:color-mix(in srgb,var(--soft) 85%,white);color:var(--text);padding:10px 12px;border-radius:999px;font-size:16px}.node.active{background:var(--accent);color:white}.node.locked{opacity:.5;cursor:not-allowed}.q-text{margin:0 0 12px;font-size:18px;line-height:1.45}.opt-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.option{min-height:64px;border:2px solid var(--soft);border-radius:14px;background:color-mix(in srgb,var(--bg) 70%,white);color:var(--text);font-size:20px;transition:transform .15s ease}.option:hover{transform:translateY(-2px) scale(1.02)}.option:disabled{opacity:.85}.hint{font-size:16px;margin-top:10px}.feedback{font-size:16px;margin-top:10px;padding:8px;border-radius:10px}.feedback.ok{background:#ecfdf3;animation:bounce .4s}.feedback.bad{background:#fff1f2;animation:shake .35s}.cats-grid{display:grid;gap:8px;grid-template-columns:repeat(2,1fr)}.cat{text-align:left;padding:10px;border-radius:12px;background:color-mix(in srgb,var(--bg) 70%,white);border:2px solid var(--soft);display:grid;gap:4px}.cat.off{opacity:.6}.cat.sel{border-color:var(--accent)}.badge-grid{display:grid;gap:8px;grid-template-columns:repeat(2,1fr)}.badge{border-radius:12px;padding:10px;border:2px solid var(--soft)}.badge.off{opacity:.5}.calendar{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}.paw{padding:4px 6px;border-radius:6px;background:var(--soft);font-size:12px}.tabbar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:2px solid var(--soft);display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:8px}.tab{min-height:48px;border-radius:10px;background:color-mix(in srgb,var(--soft) 85%,white);color:var(--text);font-size:13px}.tab.active{background:var(--accent);color:white}.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;z-index:20}.panel{width:min(680px,92vw);background:var(--card);border:2px solid var(--soft);border-radius:16px;padding:14px}.week-chart{display:flex;gap:10px;align-items:end;height:120px}.bar-col{width:26px;display:grid;gap:4px;justify-items:center}.bar-col span{width:100%;background:var(--accent);border-radius:6px 6px 0 0;min-height:4px}.danger{margin-top:10px;background:#ef4444;color:white;border-radius:10px;padding:9px 12px}.module-gap{display:grid;gap:10px;margin-top:10px}.confetti-layer{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden}.confetti-layer span{position:absolute;top:-20px;color:var(--accent);font-size:18px;animation:fall 1s linear forwards}.fade-in{animation:fade .3s ease}@keyframes bounce{0%,100%{transform:translateY(0)}45%{transform:translateY(-5px)}70%{transform:translateY(2px)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes fall{to{transform:translateY(115vh) rotate(280deg)}}@media (max-width:760px){.badge-grid,.cats-grid{grid-template-columns:1fr}}`}</style>
        <Confetti active={confetti} />
        <Header progress={progressPct} onLongPressStart={onLongPressStart} onLongPressEnd={onLongPressEnd} sessionSeconds={store.sessionSeconds} isPaused={isPaused} togglePause={() => setPaused((p) => !p)} soundOn={store.soundOn} toggleSound={() => setStore((p) => ({ ...p, soundOn: !p.soundOn }))} />

        {showTutorial && <div className="overlay" onClick={() => { setShowTutorial(false); setStore((p) => ({ ...p, tutorialSeen: true })); }}><div className="panel" onClick={(e) => e.stopPropagation()}><h3>tutoriel rapide</h3><p>choisis un module, reponds avec 4 options et gagne des etoiles.</p><p>appui long 3 secondes sur le titre pour ouvrir le tableau parental.</p><button className="ghost" onClick={() => { setShowTutorial(false); setStore((p) => ({ ...p, tutorialSeen: true })); }}>commencer</button></div></div>}

        {tab !== 'trofeos' && (
          <div className="module-gap">
            <section className="card">
              <div className="stats-row"><button className={`pill ${timerMode ? 'active' : ''}`} onClick={() => { setTimerMode((v) => !v); setTimerLeft(60); setTimerScore(0); }}>{timerMode ? 'arreter course' : 'course 60s'}</button><button className={`pill ${showHelp ? 'active' : ''}`} onClick={() => setShowHelp((v) => !v)}>aide</button>{timerMode && <span>temps: {timerLeft}s | score: {timerScore}</span>}</div>
              {tab === 'aritmetica' && <p>revision intelligente: veux-tu revoir la table de {weakTable} ?</p>}
            </section>
            <LevelPath selected={selectedLevel} unlocked={unlockedLevel} onSelect={(lv) => setStore((p) => ({ ...p, selectedLevel: { ...p.selectedLevel, [tab]: lv } }))} />
            <QuestionCard question={question} onAnswer={answer} feedback={feedback} disabled={disabled || (timerMode && timerLeft <= 0)} showHint={showHelp && (tab === 'logica' || tab === 'razonamiento')} />
            <section className="card"><p>progression niveau: {goodLevel}/8</p><ProgressBar value={(goodLevel / 8) * 100} /></section>
            <DailyPanel daily={daily} claimDaily={claimDaily} challenge={challenge} onChallengeAnswer={onChallengeAnswer} />
            <ThemePanel theme={store.theme} pattern={store.pattern} setTheme={(themeName) => setStore((p) => ({ ...p, theme: themeName }))} setPattern={(patternName) => setStore((p) => ({ ...p, pattern: patternName }))} />
            <CatGallery companion={store.companionCat} setCompanion={(name) => setStore((p) => ({ ...p, companionCat: name }))} />
          </div>
        )}

        {tab === 'trofeos' && <TrophyTab badges={store.badges} logicSuccess={store.logicSuccess} />}
        <ParentDashboard open={showParent} onClose={() => setShowParent(false)} stats={parentStats} onReset={resetAll} />
        <TabBar tab={tab} setTab={setTab} />
      </div>
    </AppContext.Provider>
  );
}
