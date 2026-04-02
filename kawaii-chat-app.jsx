import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'chat-academy-v2';

const LEVELS = [
  { id: 1, label: 'nivel 1', difficulty: 'facil' },
  { id: 2, label: 'nivel 2', difficulty: 'facil' },
  { id: 3, label: 'nivel 3', difficulty: 'medio' },
  { id: 4, label: 'nivel 4', difficulty: 'medio' },
  { id: 5, label: 'nivel 5', difficulty: 'medio' },
  { id: 6, label: 'nivel 6', difficulty: 'dificil' },
  { id: 7, label: 'nivel 7', difficulty: 'dificil' },
];

const MODULES = [
  { key: 'aritmetica', label: 'aritmetica' },
  { key: 'division', label: 'division' },
  { key: 'logica', label: 'logica' },
  { key: 'razonamiento', label: 'razonamiento' },
];

const CAT_UNLOCKS = [
  { name: 'Mimi', stars: 5 },
  { name: 'Caramel', stars: 10 },
  { name: 'Noisette', stars: 20 },
  { name: 'Perle', stars: 35 },
  { name: 'Luna', stars: 50 },
];

const MOTIVATIONS = [
  'bravo, muy bien',
  'super, sigue asi',
  'increible trabajo',
  'eres una campeona',
  'perfecto',
  'genial',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

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

function ProgressBar({ value }) {
  return (
    <div className="progress-wrap">
      <div className="progress-fill" style={{ width: `${Math.round(Math.max(0, Math.min(100, value)))}%` }} />
    </div>
  );
}

function Header({ progressByModule }) {
  const { stars, streak } = useContext(AppContext);
  return (
    <header className="header">
      <h1>mini academia gatuna</h1>
      <div className="stats">
        <span>estrellas: {stars}</span>
        <span>racha: {streak}</span>
      </div>
      <div className="module-progress-grid">
        {MODULES.map((m) => (
          <div key={m.key}>
            <small>{m.label}: {Math.round(progressByModule[m.key] || 0)}%</small>
            <ProgressBar value={progressByModule[m.key] || 0} />
          </div>
        ))}
      </div>
    </header>
  );
}

function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar">
      {MODULES.map((m) => (
        <button key={m.key} className={`tab ${active === m.key ? 'active' : ''}`} onClick={() => onChange(m.key)}>
          {m.label}
        </button>
      ))}
    </nav>
  );
}

function CatGallery() {
  const { stars } = useContext(AppContext);
  return (
    <section className="card gallery">
      <p className="title">galeria de gatos desbloqueables</p>
      <div className="cats-grid">
        {CAT_UNLOCKS.map((c) => {
          const unlocked = stars >= c.stars;
          return (
            <div key={c.name} className={`cat-card ${unlocked ? 'unlocked' : 'locked'}`}>
              <strong>{c.name}</strong>
              <small>{c.stars} estrellas</small>
              <span>{unlocked ? 'desbloqueado' : 'bloqueado'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OptionButton({ label, onClick, disabled }) {
  return (
    <button className="option-btn" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

function CatFeedback({ status, text }) {
  if (!status) return null;
  return <div className={`feedback ${status}`}>{text}</div>;
}

function QuestionCard({ question, feedback, disabled, onAnswer }) {
  return (
    <section className="card fade-in">
      <p className="question-text">{question.prompt}</p>
      <div className="options-grid">
        {question.options.map((opt) => (
          <OptionButton key={opt} label={opt} disabled={disabled} onClick={() => onAnswer(opt)} />
        ))}
      </div>
      <CatFeedback status={feedback.status} text={feedback.text} />
    </section>
  );
}

function LevelPath({ selectedLevel, setSelectedLevel, unlockedLevel }) {
  return (
    <section className="path-wrap">
      {LEVELS.map((level, idx) => {
        const locked = level.id > unlockedLevel;
        const side = idx % 2 === 0 ? 'left' : 'right';
        return (
          <div key={level.id} className={`path-row ${side}`}>
            <button
              className={`path-node ${selectedLevel === level.id ? 'active' : ''} ${locked ? 'locked' : ''}`}
              onClick={() => !locked && setSelectedLevel(level.id)}
              disabled={locked}>
              {level.label}
            </button>
          </div>
        );
      })}
    </section>
  );
}

function makeNumericOptions(answer) {
  const base = Number(answer);
  const values = new Set([String(base)]);
  while (values.size < 4) {
    const candidate = Math.max(0, base + rand(-12, 12));
    values.add(String(candidate));
  }
  return shuffle([...values]);
}

function difficultyRange(levelId) {
  if (levelId <= 2) return { min: 1, max: 15 };
  if (levelId <= 5) return { min: 8, max: 40 };
  return { min: 20, max: 90 };
}

function generateArithmetic(levelId) {
  const { min, max } = difficultyRange(levelId);
  const mode = rand(1, 3);

  if (mode === 1) {
    const a = rand(min, max);
    const b = rand(min, max);
    const c = rand(1, 20);
    const answer = a + b + c;
    return {
      prompt: `${a} + ${b} + ${c} = ?`,
      answer: String(answer),
      options: makeNumericOptions(answer),
    };
  }

  if (mode === 2) {
    const a = rand(min + 10, max + 30);
    const b = rand(min, Math.min(a - 1, max));
    const answer = a - b;
    return {
      prompt: `${a} - ${b} = ?`,
      answer: String(answer),
      options: makeNumericOptions(answer),
    };
  }

  const mulA = levelId <= 2 ? rand(1, 5) : levelId <= 5 ? rand(4, 9) : rand(7, 12);
  const mulB = rand(2, 12);
  const answer = mulA * mulB;
  return {
    prompt: `${mulA} x ${mulB} = ?`,
    answer: String(answer),
    options: makeNumericOptions(answer),
  };
}

function generateDivision(levelId) {
  const divisor = levelId <= 2 ? rand(2, 5) : levelId <= 5 ? rand(3, 9) : rand(6, 12);
  const q = rand(2, 12);
  const dividend = divisor * q;
  return {
    prompt: `${dividend} / ${divisor} = ?`,
    answer: String(q),
    options: makeNumericOptions(q),
  };
}

const LOGIC_QUESTIONS = [
  { prompt: '2, 4, 6, __ ?', answer: '8', options: ['7', '8', '9', '10'] },
  { prompt: '5, 10, 15, __ ?', answer: '20', options: ['18', '19', '20', '21'] },
  { prompt: 'ana tiene 4 gatos y recibe 2 mas, cuantos tiene?', answer: '6', options: ['5', '6', '7', '8'] },
  { prompt: 'gato, perro, coche, conejo. cual no es animal?', answer: 'coche', options: ['gato', 'perro', 'coche', 'conejo'] },
  { prompt: 'un gato tiene 4 patas. verdadero o falso?', answer: 'verdadero', options: ['verdadero', 'falso', 'a veces', 'nunca'] },
  { prompt: '3, 6, 9, __ ?', answer: '12', options: ['10', '11', '12', '13'] },
  { prompt: '12, 10, 8, __ ?', answer: '6', options: ['5', '6', '7', '8'] },
  { prompt: 'que numero es mayor?', answer: '19', options: ['12', '15', '19', '16'] },
  { prompt: 'mimi tenia 9 peces y comio 2, cuantos quedan?', answer: '7', options: ['6', '7', '8', '9'] },
  { prompt: '7, 14, 21, __ ?', answer: '28', options: ['24', '26', '28', '30'] },
  { prompt: 'que palabra es diferente?', answer: 'banana', options: ['gato', 'perro', 'conejo', 'banana'] },
  { prompt: '8, 16, 24, __ ?', answer: '32', options: ['30', '31', '32', '33'] },
  { prompt: '2 gatos y cada uno con 3 juguetes. cuantos juguetes?', answer: '6', options: ['5', '6', '7', '8'] },
  { prompt: '11 es par o impar?', answer: 'impar', options: ['par', 'impar', 'ninguno', 'los dos'] },
  { prompt: '4, 8, 12, __ ?', answer: '16', options: ['14', '15', '16', '17'] },
];

const REASON_QUESTIONS = [
  { prompt: 'gatito es a gato como cachorro es a __ ?', answer: 'perro', options: ['pez', 'perro', 'ave', 'raton'] },
  { prompt: 'orden de menor a mayor: 7, 2, 9, 4', answer: '2, 4, 7, 9', options: ['2, 4, 7, 9', '9, 7, 4, 2', '2, 7, 4, 9', '4, 2, 7, 9'] },
  { prompt: 'patron: pata flor pata flor pata __ ?', answer: 'flor', options: ['pata', 'flor', 'estrella', 'gato'] },
  { prompt: '3 cestas con 4 peces cada una, se quitan 2. cuantos quedan?', answer: '10', options: ['9', '10', '11', '12'] },
  { prompt: 'cual vuela?', answer: 'pajaro', options: ['perro', 'pajaro', 'gato', 'pez'] },
  { prompt: 'si todos los gatos duermen y mimi es gato, mimi __', answer: 'duerme', options: ['duerme', 'nada', 'vuela', 'canta'] },
  { prompt: 'completa: 1, 3, 5, 7, __', answer: '9', options: ['8', '9', '10', '11'] },
  { prompt: '20, 18, 16, __', answer: '14', options: ['12', '13', '14', '15'] },
  { prompt: 'perle tiene 6 lazos, da 1 y recibe 3. total?', answer: '8', options: ['7', '8', '9', '10'] },
  { prompt: 'que pertenece a frutas?', answer: 'manzana', options: ['manzana', 'silla', 'gato', 'lapiz'] },
  { prompt: '2 gatos comen 2 peces cada uno. total?', answer: '4', options: ['2', '3', '4', '5'] },
  { prompt: 'opuesto de grande?', answer: 'pequeno', options: ['pequeno', 'lento', 'corto', 'fuerte'] },
  { prompt: 'cuantos lados tiene un rectangulo?', answer: '4', options: ['3', '4', '5', '6'] },
  { prompt: 'animal que vive en el agua', answer: 'pez', options: ['gato', 'perro', 'pez', 'conejo'] },
  { prompt: 'orden de mayor a menor: 3, 8, 5, 1', answer: '8, 5, 3, 1', options: ['1, 3, 5, 8', '8, 3, 5, 1', '8, 5, 3, 1', '5, 8, 3, 1'] },
];

function generateLogic() {
  return pick(LOGIC_QUESTIONS);
}

function generateReasoning() {
  return pick(REASON_QUESTIONS);
}

function useQuestionEngine({ moduleKey, levelId, generator, onWinLevel, setTablesMastered, setProgress }) {
  const { stars, streak, setStars, setStreak } = useContext(AppContext);
  const [question, setQuestion] = useState(() => generator(levelId));
  const [feedback, setFeedback] = useState({ status: null, text: '' });
  const [disabled, setDisabled] = useState(false);
  const [goodInLevel, setGoodInLevel] = useState(0);

  useEffect(() => {
    setQuestion(generator(levelId));
    setFeedback({ status: null, text: '' });
    setDisabled(false);
    setGoodInLevel(0);
  }, [generator, levelId, moduleKey]);

  const nextQuestion = useCallback(() => {
    setQuestion(generator(levelId));
    setFeedback({ status: null, text: '' });
    setDisabled(false);
  }, [generator, levelId]);

  const onAnswer = useCallback(
    (choice) => {
      if (disabled) return;
      setDisabled(true);
      const isOk = String(choice).toLowerCase() === String(question.answer).toLowerCase();

      setProgress((prev) => {
        const current = prev[moduleKey] || { ok: 0, total: 0 };
        return {
          ...prev,
          [moduleKey]: { ok: current.ok + (isOk ? 1 : 0), total: current.total + 1 },
        };
      });

      if (isOk) {
        const nextGood = goodInLevel + 1;
        setGoodInLevel(nextGood);
        setStars(stars + 1);
        setStreak(streak + 1);
        setFeedback({ status: 'ok', text: pick(MOTIVATIONS) });

        if (moduleKey === 'aritmetica' && question.prompt.includes('x')) {
          const table = Number(question.prompt.split(' x ')[0]);
          if (!Number.isNaN(table) && table >= 1 && table <= 12) {
            setTablesMastered((prev) => {
              const next = [...prev];
              next[table - 1] = true;
              return next;
            });
          }
        }

        if (nextGood >= 8) {
          onWinLevel();
          setGoodInLevel(0);
        }

        setTimeout(nextQuestion, 900);
      } else {
        setFeedback({ status: 'bad', text: 'respuesta incorrecta, prueba otra vez' });
        setStreak(0);
        setDisabled(false);
      }
    },
    [disabled, question, moduleKey, goodInLevel, setStars, stars, setStreak, streak, setTablesMastered, setProgress, onWinLevel, nextQuestion]
  );

  return { question, feedback, disabled, goodInLevel, onAnswer };
}

function ModuleTemplate({
  moduleKey,
  selectedLevel,
  unlockedLevel,
  setSelectedLevel,
  setUnlockedLevel,
  generator,
  setTablesMastered,
  setProgress,
  subtitle,
}) {
  const onWinLevel = useCallback(() => {
    setUnlockedLevel((prev) => Math.min(LEVELS.length, Math.max(prev, selectedLevel + 1)));
  }, [selectedLevel, setUnlockedLevel]);

  const engine = useQuestionEngine({
    moduleKey,
    levelId: selectedLevel,
    generator,
    onWinLevel,
    setTablesMastered,
    setProgress,
  });

  return (
    <section className="module-wrap">
      <section className="card fade-in">
        <p className="title">{subtitle}</p>
        <p className="small">acierta 8 seguidas para desbloquear el siguiente nivel</p>
        <ProgressBar value={(engine.goodInLevel / 8) * 100} />
      </section>

      <LevelPath selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} unlockedLevel={unlockedLevel} />

      <QuestionCard
        question={engine.question}
        feedback={engine.feedback}
        disabled={engine.disabled}
        onAnswer={engine.onAnswer}
      />
    </section>
  );
}

export default function App() {
  const [store, setStore] = useLocalStorage(STORAGE_KEY, {
    stars: 0,
    streak: 0,
    tablesMastered: Array(12).fill(false),
    selectedLevel: {
      aritmetica: 1,
      division: 1,
      logica: 1,
      razonamiento: 1,
    },
    unlockedLevel: {
      aritmetica: 1,
      division: 1,
      logica: 1,
      razonamiento: 1,
    },
    progress: {
      aritmetica: { ok: 0, total: 0 },
      division: { ok: 0, total: 0 },
      logica: { ok: 0, total: 0 },
      razonamiento: { ok: 0, total: 0 },
    },
  });

  const [activeTab, setActiveTab] = useState('aritmetica');

  const setSelectedLevel = (moduleKey, value) => {
    setStore((prev) => ({
      ...prev,
      selectedLevel: { ...prev.selectedLevel, [moduleKey]: value },
    }));
  };

  const setUnlockedLevel = (moduleKey, updater) => {
    setStore((prev) => {
      const current = prev.unlockedLevel[moduleKey];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        unlockedLevel: { ...prev.unlockedLevel, [moduleKey]: next },
      };
    });
  };

  const progressByModule = useMemo(() => {
    const out = {};
    MODULES.forEach((m) => {
      const current = store.progress[m.key];
      out[m.key] = current.total > 0 ? (current.ok / current.total) * 100 : 0;
    });
    return out;
  }, [store.progress]);

  const contextValue = useMemo(
    () => ({
      stars: store.stars,
      streak: store.streak,
      setStars: (value) => setStore((prev) => ({ ...prev, stars: value })),
      setStreak: (value) => setStore((prev) => ({ ...prev, streak: value })),
    }),
    [store.stars, store.streak, setStore]
  );

  const moduleProps = {
    selectedLevel: store.selectedLevel[activeTab],
    unlockedLevel: store.unlockedLevel[activeTab],
    setSelectedLevel: (val) => setSelectedLevel(activeTab, val),
    setUnlockedLevel: (updater) => setUnlockedLevel(activeTab, updater),
    setTablesMastered: (fn) => setStore((prev) => ({ ...prev, tablesMastered: fn(prev.tablesMastered) })),
    setProgress: (fn) => setStore((prev) => ({ ...prev, progress: fn(prev.progress) })),
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Nunito, Arial, sans-serif; background: #fdf4fb; }
          .app {
            min-height: 100vh;
            background:
              radial-gradient(circle at 20px 20px, rgba(168,85,181,0.14) 0 5px, transparent 6px),
              radial-gradient(circle at 46px 44px, rgba(232,180,240,0.14) 0 7px, transparent 8px),
              #fef9f0;
            color: #4c1d59;
            padding: 14px 14px 92px;
          }
          .header, .card { background: #fffdfd; border: 2px solid #e8b4f0; border-radius: 16px; padding: 12px; }
          .header h1 { margin: 0 0 8px; font-size: 24px; }
          .stats { display: flex; gap: 10px; flex-wrap: wrap; font-size: 16px; }
          .module-progress-grid { margin-top: 8px; display: grid; gap: 8px; }
          .progress-wrap { margin-top: 4px; height: 10px; border-radius: 999px; background: #f2daf6; overflow: hidden; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #a855b5, #e8b4f0); }
          .module-wrap { margin-top: 12px; display: grid; gap: 10px; }
          .title { margin: 0 0 6px; font-size: 18px; }
          .small { margin: 0 0 8px; font-size: 15px; }
          .path-wrap { display: grid; gap: 8px; padding: 6px; }
          .path-row { display: flex; }
          .path-row.left { justify-content: flex-start; }
          .path-row.right { justify-content: flex-end; }
          .path-node {
            min-width: 128px; padding: 10px 14px; border-radius: 999px; border: none;
            background: #f5e5fa; color: #5b2568; font-size: 16px; cursor: pointer;
          }
          .path-node.active { background: #a855b5; color: #fff; }
          .path-node.locked { background: #ece4ee; color: #8a7890; cursor: not-allowed; }
          .question-text { margin: 0 0 12px; font-size: 18px; line-height: 1.45; }
          .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .option-btn {
            min-height: 64px; font-size: 20px; border-radius: 14px; border: 2px solid #e8b4f0;
            background: #fdf4fb; color: #4c1d59; cursor: pointer;
          }
          .option-btn:disabled { opacity: 0.8; cursor: default; }
          .feedback { margin-top: 10px; padding: 10px; border-radius: 12px; font-size: 16px; }
          .feedback.ok { background: #ebfdf1; animation: bounce .4s; }
          .feedback.bad { background: #fff1f2; animation: shake .35s; }
          .gallery { margin-top: 12px; }
          .cats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
          .cat-card { padding: 8px; border-radius: 12px; border: 2px dashed #e8b4f0; display: grid; gap: 4px; text-align: center; }
          .cat-card.unlocked { border-style: solid; background: #fff; }
          .cat-card.locked { opacity: 0.65; }
          .tabbar {
            position: fixed; left: 0; right: 0; bottom: 0; padding: 8px;
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
            border-top: 2px solid #e8b4f0; background: #fff;
          }
          .tab {
            min-height: 52px; border: none; border-radius: 12px; font-size: 14px;
            background: #f2daf6; color: #4c1d59; cursor: pointer;
          }
          .tab.active { background: #a855b5; color: #fff; }
          .fade-in { animation: fadeIn .3s ease; }
          @keyframes bounce { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-5px)} 70%{transform:translateY(2px)} }
          @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 720px) {
            .cats-grid { grid-template-columns: repeat(3, 1fr); }
          }
        `}</style>

        <Header progressByModule={progressByModule} />

        {activeTab === 'aritmetica' && (
          <ModuleTemplate
            {...moduleProps}
            moduleKey="aritmetica"
            generator={generateArithmetic}
            subtitle="sumas, restas y multiplicaciones"
          />
        )}

        {activeTab === 'division' && (
          <ModuleTemplate
            {...moduleProps}
            moduleKey="division"
            generator={generateDivision}
            subtitle="divisiones por niveles"
          />
        )}

        {activeTab === 'logica' && (
          <ModuleTemplate
            {...moduleProps}
            moduleKey="logica"
            generator={generateLogic}
            subtitle="retos de logica con preguntas variadas"
          />
        )}

        {activeTab === 'razonamiento' && (
          <ModuleTemplate
            {...moduleProps}
            moduleKey="razonamiento"
            generator={generateReasoning}
            subtitle="deduccion y pensamiento paso a paso"
          />
        )}

        <CatGallery />
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>
    </AppContext.Provider>
  );
}
