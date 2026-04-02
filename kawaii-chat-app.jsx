import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'chat-app-progress-v1';
const MOTIVATIONS = ['Bravo !', 'Super fort(e) !', 'Continue comme ça !', 'Tu es une championne !', 'Incroyable !', 'Parfait !'];
const LEVELS = ['facile', 'moyen', 'difficile'];
const CATS = [
  { name: 'Mimi', emoji: '??', stars: 5 },
  { name: 'Caramel', emoji: '??', stars: 10 },
  { name: 'Noisette', emoji: '??', stars: 20 },
  { name: 'Perle', emoji: '??', stars: 35 },
  { name: 'Luna', emoji: '?', stars: 50 },
];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeOptions(correct) {
  const set = new Set([String(correct)]);
  while (set.size < 4) {
    const delta = rand(1, 8);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const val = Number(correct) + sign * delta;
    set.add(String(Math.max(0, val)));
  }
  return shuffle([...set]);
}

function ProgressBar({ value }) {
  return (
    <div className="progress-wrap">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(value))}%` }} />
    </div>
  );
}

function LevelSelector({ value, onChange }) {
  return (
    <div className="level-row">
      {LEVELS.map((lvl) => (
        <button key={lvl} className={`pill ${value === lvl ? 'active' : ''}`} onClick={() => onChange(lvl)}>
          {lvl}
        </button>
      ))}
    </div>
  );
}

function OptionButton({ text, onClick, disabled }) {
  return (
    <button className="option-btn" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

function CatFeedback({ state, message }) {
  if (!state) return null;
  return (
    <div className={`feedback ${state}`}>
      {state === 'ok' ? '? ?? ? ' : '? ?? '}
      {message}
    </div>
  );
}

function QuestionCard({ question, onAnswer, feedback, disabled }) {
  return (
    <div className="card fade-in">
      <p className="question">{question.prompt}</p>
      <div className="grid-2">
        {question.options.map((opt) => (
          <OptionButton key={opt} text={opt} onClick={() => onAnswer(opt)} disabled={disabled} />
        ))}
      </div>
      <CatFeedback state={feedback.state} message={feedback.message} />
    </div>
  );
}

function TableView() {
  return (
    <div className="card fade-in">
      <p className="question">tables de multiplication de 1 à 12</p>
      <div className="table-grid">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <div key={n} className="table-col">
            <strong>table de {n}</strong>
            {Array.from({ length: 12 }, (_, j) => j + 1).map((m) => (
              <span key={m}>{`${n} × ${m} = ${n * m}`}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function moduleRange(level) {
  if (level === 'facile') return [1, 5];
  if (level === 'moyen') return [6, 9];
  return [10, 12];
}

function generateMultiplication(level) {
  const [min, max] = moduleRange(level);
  const a = rand(min, max);
  const b = rand(1, 12);
  const answer = a * b;
  return { prompt: `${a} × ${b} = ?`, answer: String(answer), options: makeOptions(answer) };
}

function generateDivision(level) {
  const [min, max] = moduleRange(level);
  const divisor = rand(min, max);
  const q = rand(1, 12);
  const dividend = divisor * q;
  return { prompt: `${dividend} ÷ ${divisor} = ?`, answer: String(q), options: makeOptions(q) };
}

const LOGIC_BANK = [
  () => ({ prompt: '2, 4, 6, __ ?', answer: '8', options: ['7', '8', '9', '10'] }),
  () => ({ prompt: '5, 10, 15, __ ?', answer: '20', options: ['18', '19', '20', '22'] }),
  () => ({ prompt: 'Léa a 5 pommes, Tom en a 3 de plus. Combien en a Tom ?', answer: '8', options: ['7', '8', '9', '10'] }),
  () => ({ prompt: 'Chat, Chien, Voiture, Lapin : lequel n\'est pas un animal ?', answer: 'Voiture', options: ['Chat', 'Chien', 'Voiture', 'Lapin'] }),
  () => ({ prompt: 'Un chat a 6 pattes. vrai ou faux ?', answer: 'Faux', options: ['Vrai', 'Faux', 'Parfois', 'Je ne sais pas'] }),
  () => ({ prompt: 'Mimi a 2 pelotes puis en reçoit 4. combien en a-t-elle ?', answer: '6', options: ['5', '6', '7', '8'] }),
  () => ({ prompt: '12, 10, 8, __ ?', answer: '6', options: ['4', '5', '6', '7'] }),
  () => ({ prompt: 'Lequel est le plus grand ?', answer: '19', options: ['9', '19', '12', '15'] }),
  () => ({ prompt: '??, ??, ??, ??, ??, __ ?', answer: '??', options: ['??', '??', '?', '??'] }),
  () => ({ prompt: 'Noisette a 9 poissons, elle en mange 2. combien reste ?', answer: '7', options: ['6', '7', '8', '9'] }),
  () => ({ prompt: '3, 6, 9, __ ?', answer: '12', options: ['10', '11', '12', '13'] }),
  () => ({ prompt: 'Lequel n\'est pas un nombre pair ?', answer: '11', options: ['8', '10', '11', '12'] }),
  () => ({ prompt: 'Un chaton est un bébé chat. vrai ou faux ?', answer: 'Vrai', options: ['Vrai', 'Faux', 'Parfois', 'Jamais'] }),
  () => ({ prompt: 'Mimi voit 4 oiseaux puis 4 autres. combien au total ?', answer: '8', options: ['7', '8', '9', '10'] }),
  () => ({ prompt: '7, 14, 21, __ ?', answer: '28', options: ['26', '27', '28', '29'] }),
  () => ({ prompt: 'Quel mot est différent ?', answer: 'Banane', options: ['Chat', 'Chien', 'Lapin', 'Banane'] }),
];

function generateLogic() {
  return pick(LOGIC_BANK)();
}

const REASON_BANK = [
  () => ({ prompt: 'Chaton est à chat ce que chiot est à __ ?', answer: 'Chien', options: ['Poisson', 'Chien', 'Oiseau', 'Lapin'] }),
  () => ({ prompt: 'Range du plus petit au plus grand : 7, 2, 9, 4', answer: '2, 4, 7, 9', options: ['2, 4, 7, 9', '9, 7, 4, 2', '2, 7, 4, 9', '4, 2, 7, 9'] }),
  () => ({ prompt: '?????????? __ ?', answer: '??', options: ['??', '??', '?', '??'] }),
  () => ({ prompt: 'Il y a 3 paniers. chaque panier a 4 poissons. on enlève 2 poissons. combien reste ?', answer: '10', options: ['8', '9', '10', '12'] }),
  () => ({ prompt: 'Lequel vole ?', answer: 'Oiseau', options: ['Chien', 'Oiseau', 'Chat', 'Poisson'] }),
  () => ({ prompt: 'Si tous les chats aiment le lait, et Mimi est un chat, Mimi aime ?', answer: 'Le lait', options: ['Le lait', 'Le vélo', 'La pluie', 'Le sable'] }),
  () => ({ prompt: 'Complète : 1, 3, 5, 7, __', answer: '9', options: ['8', '9', '10', '11'] }),
  () => ({ prompt: 'Quel nombre manque : 20, 18, 16, __', answer: '14', options: ['12', '13', '14', '15'] }),
  () => ({ prompt: 'Perle a 6 rubans, elle en donne 1 puis en reçoit 3. combien a-t-elle ?', answer: '8', options: ['7', '8', '9', '10'] }),
  () => ({ prompt: 'Lequel est une catégorie de fruits ?', answer: 'Pomme', options: ['Pomme', 'Chat', 'Table', 'Crayon'] }),
  () => ({ prompt: 'Si 2 chats mangent 2 poissons chacun, combien de poissons ?', answer: '4', options: ['2', '3', '4', '5'] }),
  () => ({ prompt: 'Motif : ??????? __ ?', answer: '??', options: ['?', '??', '??', '??'] }),
  () => ({ prompt: 'Le contraire de grand ?', answer: 'Petit', options: ['Petit', 'Lourd', 'Rapide', 'Content'] }),
  () => ({ prompt: 'Un rectangle a combien de côtés ?', answer: '4', options: ['3', '4', '5', '6'] }),
  () => ({ prompt: 'Quel animal vit dans l\'eau ?', answer: 'Poisson', options: ['Chat', 'Chien', 'Poisson', 'Lapin'] }),
  () => ({ prompt: 'Range du plus grand au plus petit : 3, 8, 5, 1', answer: '8, 5, 3, 1', options: ['1, 3, 5, 8', '8, 5, 3, 1', '8, 3, 5, 1', '5, 8, 3, 1'] }),
];

function generateReasoning() {
  return pick(REASON_BANK)();
}

function useQuestionFlow(generator, moduleKey, level, setTables, setModuleProgress) {
  const [question, setQuestion] = useState(() => generator(level));
  const [feedback, setFeedback] = useState({ state: null, message: '' });
  const [locked, setLocked] = useState(false);
  const { stars, setStars, streak, setStreak } = useContext(AppContext);

  useEffect(() => {
    setQuestion(generator(level));
    setFeedback({ state: null, message: '' });
    setLocked(false);
  }, [generator, level]);

  const askNext = useCallback(() => {
    setQuestion(generator(level));
    setFeedback({ state: null, message: '' });
    setLocked(false);
  }, [generator, level]);

  const onAnswer = useCallback(
    (choice) => {
      if (locked) return;
      setLocked(true);
      const ok = String(choice) === String(question.answer);

      setModuleProgress((prev) => {
        const old = prev[moduleKey] || { ok: 0, total: 0 };
        return {
          ...prev,
          [moduleKey]: { ok: old.ok + (ok ? 1 : 0), total: old.total + 1 },
        };
      });

      if (ok) {
        setFeedback({ state: 'ok', message: pick(MOTIVATIONS) });
        setStars(stars + 1);
        setStreak(streak + 1);

        if (moduleKey === 'multiplication') {
          const table = Number(question.prompt.split(' × ')[0]);
          if (!Number.isNaN(table)) {
            setTables((prev) => {
              const next = [...prev];
              next[table - 1] = true;
              return next;
            });
          }
        }

        setTimeout(() => askNext(), 900);
      } else {
        setFeedback({ state: 'bad', message: 'Essaie encore, tu vas y arriver !' });
        setStreak(0);
        setLocked(false);
      }
    },
    [locked, question, moduleKey, setModuleProgress, setStars, stars, setStreak, streak, setTables, askNext]
  );

  return { question, feedback, onAnswer, locked };
}

function MultiplicationModule({ level, setLevel, setTables, setModuleProgress }) {
  const [view, setView] = useState('pratiquer');
  const flow = useQuestionFlow(generateMultiplication, 'multiplication', level, setTables, setModuleProgress);

  return (
    <div className="module">
      <div className="subtabs">
        <button className={`pill ${view === 'apprendre' ? 'active' : ''}`} onClick={() => setView('apprendre')}>apprendre</button>
        <button className={`pill ${view === 'pratiquer' ? 'active' : ''}`} onClick={() => setView('pratiquer')}>pratiquer</button>
      </div>
      <LevelSelector value={level} onChange={setLevel} />
      {view === 'apprendre' ? (
        <TableView />
      ) : (
        <QuestionCard question={flow.question} onAnswer={flow.onAnswer} feedback={flow.feedback} disabled={flow.locked} />
      )}
    </div>
  );
}

function DivisionModule({ level, setLevel, setModuleProgress }) {
  const flow = useQuestionFlow(generateDivision, 'division', level, () => {}, setModuleProgress);
  return (
    <div className="module">
      <LevelSelector value={level} onChange={setLevel} />
      <QuestionCard question={flow.question} onAnswer={flow.onAnswer} feedback={flow.feedback} disabled={flow.locked} />
    </div>
  );
}

function LogicModule({ setModuleProgress }) {
  const flow = useQuestionFlow(generateLogic, 'logique', 'facile', () => {}, setModuleProgress);
  return (
    <div className="module">
      <QuestionCard question={flow.question} onAnswer={flow.onAnswer} feedback={flow.feedback} disabled={flow.locked} />
    </div>
  );
}

function ReasoningModule({ setModuleProgress }) {
  const flow = useQuestionFlow(generateReasoning, 'raisonnement', 'facile', () => {}, setModuleProgress);
  return (
    <div className="module">
      <QuestionCard question={flow.question} onAnswer={flow.onAnswer} feedback={flow.feedback} disabled={flow.locked} />
    </div>
  );
}

function CatGallery() {
  const { stars } = useContext(AppContext);
  return (
    <div className="gallery card">
      <p className="question">galerie de chats débloquables</p>
      <div className="cats">
        {CATS.map((cat) => {
          const unlocked = stars >= cat.stars;
          return (
            <div key={cat.name} className={`cat ${unlocked ? 'on' : 'off'}`}>
              <span className="cat-emoji">{unlocked ? cat.emoji : '??'}</span>
              <span>{cat.name}</span>
              <small>{cat.stars}?</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header({ moduleProgress }) {
  const { stars, streak } = useContext(AppContext);
  const progressPct = useMemo(() => {
    const map = {};
    Object.keys(moduleProgress).forEach((k) => {
      const m = moduleProgress[k];
      map[k] = m.total ? (m.ok / m.total) * 100 : 0;
    });
    return map;
  }, [moduleProgress]);

  return (
    <header className="header">
      <h1>?? mini académie des chats</h1>
      <div className="stats">
        <span>étoiles : {stars} ?</span>
        <span>série : {streak} ??</span>
      </div>
      <div className="progress-list">
        {['multiplication', 'division', 'logique', 'raisonnement'].map((k) => (
          <div key={k}>
            <small>{k} {Math.round(progressPct[k] || 0)}%</small>
            <ProgressBar value={progressPct[k] || 0} />
          </div>
        ))}
      </div>
    </header>
  );
}

function TabBar({ tab, setTab }) {
  const tabs = [
    { key: 'multiplication', label: '?? multiplication' },
    { key: 'division', label: '? division' },
    { key: 'logique', label: '?? logique' },
    { key: 'raisonnement', label: '?? raisonnement' },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [saved, setSaved] = useLocalStorage(STORAGE_KEY, {
    stars: 0,
    streak: 0,
    tables: Array(12).fill(false),
    levels: { multiplication: 'facile', division: 'facile', logique: 'facile', raisonnement: 'facile' },
    moduleProgress: {
      multiplication: { ok: 0, total: 0 },
      division: { ok: 0, total: 0 },
      logique: { ok: 0, total: 0 },
      raisonnement: { ok: 0, total: 0 },
    },
  });

  const [tab, setTab] = useState('multiplication');

  const unlockedCats = useMemo(() => CATS.filter((c) => saved.stars >= c.stars).map((c) => c.name), [saved.stars]);

  const ctx = useMemo(() => ({
    stars: saved.stars,
    setStars: (n) => setSaved((p) => ({ ...p, stars: n })),
    streak: saved.streak,
    setStreak: (n) => setSaved((p) => ({ ...p, streak: n })),
    unlockedCats,
  }), [saved.stars, saved.streak, unlockedCats, setSaved]);

  const setLevel = (moduleName, value) => {
    setSaved((p) => ({ ...p, levels: { ...p.levels, [moduleName]: value } }));
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; font-family: 'Nunito', sans-serif; background: #fdf4fb; }
          .app {
            min-height: 100vh; padding: 14px 14px 90px;
            background:
              radial-gradient(circle at 20px 20px, rgba(168,85,181,0.1) 0 6px, transparent 7px),
              radial-gradient(circle at 45px 45px, rgba(232,180,240,0.18) 0 7px, transparent 8px),
              #fef9f0;
            color: #4c1d59;
          }
          .header { background: #ffffffd9; border: 2px solid #e8b4f0; border-radius: 18px; padding: 14px; }
          h1 { margin: 0 0 8px; font-size: 26px; }
          .stats { display: flex; gap: 12px; flex-wrap: wrap; font-size: 16px; }
          .progress-list { margin-top: 10px; display: grid; gap: 8px; }
          .progress-wrap { background: #f3d9fb; height: 10px; border-radius: 999px; overflow: hidden; }
          .progress-fill { background: linear-gradient(90deg, #a855b5, #e8b4f0); height: 100%; }
          .subtabs, .level-row { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
          .pill, .tab, .option-btn {
            border: none; border-radius: 14px; background: #f3d9fb; color: #4c1d59; cursor: pointer;
            font-family: inherit;
          }
          .pill { padding: 10px 14px; font-size: 16px; }
          .pill.active, .tab.active { background: #a855b5; color: white; }
          .card { background: #fff; border: 2px solid #e8b4f0; border-radius: 18px; padding: 14px; }
          .question { font-size: 18px; line-height: 1.4; margin: 0 0 12px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .option-btn { font-size: 20px; min-height: 62px; padding: 12px; background: #fdf4fb; border: 2px solid #e8b4f0; }
          .option-btn:hover { transform: translateY(-1px); }
          .feedback { margin-top: 12px; font-size: 16px; padding: 10px; border-radius: 12px; }
          .feedback.ok { background: #ecfdf3; animation: bounce .4s; }
          .feedback.bad { background: #fff1f2; animation: shake .35s; }
          .table-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
          .table-col { background: #fef9f0; border-radius: 12px; padding: 8px; display: grid; gap: 2px; font-size: 15px; }
          .gallery { margin-top: 12px; }
          .cats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
          .cat { border-radius: 12px; padding: 8px; text-align: center; background: #fdf4fb; border: 2px dashed #e8b4f0; }
          .cat.on { background: #fff; border-style: solid; }
          .cat-emoji { font-size: 24px; display: block; }
          .tabbar {
            position: fixed; left: 0; right: 0; bottom: 0; background: #fff;
            border-top: 2px solid #e8b4f0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 8px;
          }
          .tab { padding: 10px 8px; font-size: 14px; min-height: 52px; }
          .module { margin-top: 12px; }
          .fade-in { animation: fadeIn .3s ease; }
          @keyframes bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} 70%{transform:translateY(2px)} }
          @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 640px) {
            .grid-2 { grid-template-columns: 1fr 1fr; }
            .cats { grid-template-columns: repeat(3, 1fr); }
            h1 { font-size: 23px; }
          }
        `}</style>

        <Header moduleProgress={saved.moduleProgress} />

        {tab === 'multiplication' && (
          <MultiplicationModule
            level={saved.levels.multiplication}
            setLevel={(v) => setLevel('multiplication', v)}
            setTables={(fn) => setSaved((p) => ({ ...p, tables: fn(p.tables) }))}
            setModuleProgress={(fn) => setSaved((p) => ({ ...p, moduleProgress: fn(p.moduleProgress) }))}
          />
        )}
        {tab === 'division' && (
          <DivisionModule
            level={saved.levels.division}
            setLevel={(v) => setLevel('division', v)}
            setModuleProgress={(fn) => setSaved((p) => ({ ...p, moduleProgress: fn(p.moduleProgress) }))}
          />
        )}
        {tab === 'logique' && (
          <LogicModule
            setModuleProgress={(fn) => setSaved((p) => ({ ...p, moduleProgress: fn(p.moduleProgress) }))}
          />
        )}
        {tab === 'raisonnement' && (
          <ReasoningModule
            setModuleProgress={(fn) => setSaved((p) => ({ ...p, moduleProgress: fn(p.moduleProgress) }))}
          />
        )}

        <CatGallery />
        <TabBar tab={tab} setTab={setTab} />
      </div>
    </AppContext.Provider>
  );
}
