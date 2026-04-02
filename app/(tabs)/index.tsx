import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Exercise, levels } from '@/data/exerciseData';

type Mode = 'normal' | 'showAnswers';

type LevelAnswers = Record<number, string | string[]>;
type ExerciseResult = Record<number, boolean>;

type SavedProgress = {
  completedLevels: number[];
  bestScores: Record<number, number>;
  mode: Mode;
};

const STORAGE_KEY = 'kids-logic-progress-v1';

function readProgress(): SavedProgress {
  const storage = (globalThis as { localStorage?: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void } }).localStorage;
  if (!storage) {
    return { completedLevels: [], bestScores: {}, mode: 'normal' };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { completedLevels: [], bestScores: {}, mode: 'normal' };

  try {
    const parsed = JSON.parse(raw) as SavedProgress;
    return {
      completedLevels: parsed.completedLevels ?? [],
      bestScores: parsed.bestScores ?? {},
      mode: parsed.mode ?? 'normal',
    };
  } catch {
    return { completedLevels: [], bestScores: {}, mode: 'normal' };
  }
}

function writeProgress(progress: SavedProgress) {
  const storage = (globalThis as { localStorage?: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void } }).localStorage;
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function createInitialAnswers(levelId: number): LevelAnswers {
  const level = levels.find((item) => item.id === levelId);
  if (!level) return {};

  return level.exercises.reduce<LevelAnswers>((acc, exercise) => {
    acc[exercise.id] = Array.isArray(exercise.answer)
      ? new Array(exercise.answer.length).fill('')
      : '';
    return acc;
  }, {});
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isExerciseCorrect(exercise: Exercise, answer: string | string[]) {
  if (Array.isArray(exercise.answer)) {
    if (!Array.isArray(answer) || answer.length !== exercise.answer.length) return false;
    return exercise.answer.every((item, index) => normalize(answer[index] ?? '') === normalize(item));
  }

  if (Array.isArray(answer)) return false;
  return normalize(answer) === normalize(exercise.answer);
}

function formatAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(', ') : answer;
}

function ExerciseCard({
  exercise,
  value,
  mode,
  checked,
  isCorrect,
  onChange,
}: {
  exercise: Exercise;
  value: string | string[];
  mode: Mode;
  checked: boolean;
  isCorrect?: boolean;
  onChange: (next: string | string[]) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (checked && isCorrect) {
      Animated.sequence([
        Animated.spring(pulse, { toValue: 1.04, useNativeDriver: true }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [checked, isCorrect, pulse]);

  const statusStyle =
    checked && typeof isCorrect === 'boolean'
      ? isCorrect
        ? styles.cardOk
        : styles.cardBad
      : styles.cardDefault;

  return (
    <Animated.View style={[styles.exerciseCard, statusStyle, { transform: [{ scale: pulse }] }]}>
      <Text style={styles.exerciseTitle}>Ejercicio {exercise.id}</Text>
      <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>

      {exercise.type === 'comparison' ? (
        <View style={styles.comparisonRow}>
          {['<', '=', '>'].map((symbol) => {
            const selected = value === symbol;
            return (
              <Pressable
                key={symbol}
                style={[styles.symbolButton, selected && styles.symbolButtonSelected]}
                onPress={() => onChange(symbol)}>
                <Text style={[styles.symbolText, selected && styles.symbolTextSelected]}>{symbol}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : Array.isArray(exercise.answer) ? (
        <View style={styles.seriesRow}>
          {exercise.answer.map((_, index) => (
            <TextInput
              key={`${exercise.id}-${index}`}
              style={styles.inputSmall}
              keyboardType="default"
              value={Array.isArray(value) ? value[index] ?? '' : ''}
              onChangeText={(text) => {
                const next = Array.isArray(value)
                  ? [...value]
                  : new Array(exercise.answer.length).fill('');
                next[index] = text;
                onChange(next);
              }}
              placeholder={`#${index + 1}`}
              placeholderTextColor="#94a3b8"
            />
          ))}
        </View>
      ) : (
        <TextInput
          style={styles.input}
          keyboardType={exercise.type === 'pattern' ? 'default' : 'numeric'}
          value={typeof value === 'string' ? value : ''}
          onChangeText={(text) => onChange(text)}
          placeholder={exercise.placeholder ?? 'Respuesta'}
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
        />
      )}

      {checked && isCorrect === false && (
        <Text style={styles.correctAnswer}>Respuesta correcta: {formatAnswer(exercise.answer)}</Text>
      )}

      {mode === 'showAnswers' && (
        <Text style={styles.showAnswer}>Pista: {formatAnswer(exercise.answer)}</Text>
      )}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('normal');
  const [answers, setAnswers] = useState<LevelAnswers>({});
  const [results, setResults] = useState<ExerciseResult>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});

  useEffect(() => {
    const saved = readProgress();
    setCompletedLevels(saved.completedLevels);
    setBestScores(saved.bestScores);
    setMode(saved.mode);
  }, []);

  const currentLevel = useMemo(
    () => levels.find((level) => level.id === selectedLevel) ?? null,
    [selectedLevel]
  );

  const completedCount = completedLevels.length;
  const progressPercent = Math.round((completedCount / levels.length) * 100);

  function persist(nextCompleted: number[], nextBestScores: Record<number, number>, nextMode = mode) {
    writeProgress({ completedLevels: nextCompleted, bestScores: nextBestScores, mode: nextMode });
  }

  function startLevel(levelId: number) {
    setSelectedLevel(levelId);
    setAnswers(createInitialAnswers(levelId));
    setResults({});
    setChecked(false);
    setScore(null);
  }

  function verifyLevel() {
    if (!currentLevel) return;

    const nextResults: ExerciseResult = {};
    let points = 0;

    currentLevel.exercises.forEach((exercise) => {
      const userAnswer = answers[exercise.id] ?? (Array.isArray(exercise.answer) ? [] : '');
      const ok = isExerciseCorrect(exercise, userAnswer);
      nextResults[exercise.id] = ok;
      if (ok) points += 1;
    });

    setResults(nextResults);
    setChecked(true);
    setScore(points);

    const nextCompleted = completedLevels.includes(currentLevel.id)
      ? completedLevels
      : [...completedLevels, currentLevel.id];
    const currentBest = bestScores[currentLevel.id] ?? 0;
    const nextBestScores = { ...bestScores, [currentLevel.id]: Math.max(currentBest, points) };

    setCompletedLevels(nextCompleted);
    setBestScores(nextBestScores);
    persist(nextCompleted, nextBestScores);
  }

  function retryLevel() {
    if (!currentLevel) return;
    setAnswers(createInitialAnswers(currentLevel.id));
    setResults({});
    setChecked(false);
    setScore(null);
  }

  function toggleMode(nextMode: Mode) {
    setMode(nextMode);
    persist(completedLevels, bestScores, nextMode);
  }

  if (!currentLevel) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Lógica y Matemáticas</Text>
        <Text style={styles.subtitle}>Elige un nivel y resuelve 10 ejercicios.</Text>

        <View style={styles.modeBox}>
          <Text style={styles.modeLabel}>Modo de juego</Text>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === 'normal' && styles.modeButtonActive]}
              onPress={() => toggleMode('normal')}>
              <Text style={[styles.modeText, mode === 'normal' && styles.modeTextActive]}>
                Resolver sin ayudas
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === 'showAnswers' && styles.modeButtonActive]}
              onPress={() => toggleMode('showAnswers')}>
              <Text style={[styles.modeText, mode === 'showAnswers' && styles.modeTextActive]}>
                Mostrar respuestas
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>Progreso general: {completedCount}/5 niveles</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.grid}>
          {levels.map((level) => {
            const completed = completedLevels.includes(level.id);
            const best = bestScores[level.id];
            return (
              <Pressable
                key={level.id}
                onPress={() => startLevel(level.id)}
                style={[styles.levelCard, completed && styles.levelCardDone]}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelInfo}>10 ejercicios</Text>
                {completed ? (
                  <Text style={styles.levelDone}>Completado · Mejor: {best ?? 0}/10</Text>
                ) : (
                  <Text style={styles.levelPending}>Pendiente</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.levelHeader}>
        <Pressable style={styles.backButton} onPress={() => setSelectedLevel(null)}>
          <Text style={styles.backButtonText}>Volver a niveles</Text>
        </Pressable>
        <Text style={styles.levelHeading}>{currentLevel.title}</Text>
        <Text style={styles.levelSubheading}>Completa los 10 ejercicios</Text>
      </View>

      {currentLevel.exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          value={answers[exercise.id] ?? (Array.isArray(exercise.answer) ? [] : '')}
          checked={checked}
          isCorrect={results[exercise.id]}
          mode={mode}
          onChange={(next) =>
            setAnswers((prev) => ({
              ...prev,
              [exercise.id]: next,
            }))
          }
        />
      ))}

      <Pressable style={styles.actionButton} onPress={verifyLevel}>
        <Text style={styles.actionButtonText}>Verificar respuestas</Text>
      </Pressable>

      <Pressable style={styles.retryButton} onPress={retryLevel}>
        <Text style={styles.retryButtonText}>Reintentar nivel</Text>
      </Pressable>

      {score !== null && <Text style={styles.scoreText}>Puntuación: {score}/10</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 6,
  },
  modeBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  modeLabel: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 8,
  },
  modeRow: {
    gap: 8,
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  modeButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  modeText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  progressText: {
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  grid: {
    gap: 10,
  },
  levelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  levelCardDone: {
    borderColor: '#4ade80',
    backgroundColor: '#f0fdf4',
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0c4a6e',
  },
  levelInfo: {
    marginTop: 4,
    fontSize: 15,
    color: '#334155',
  },
  levelDone: {
    marginTop: 8,
    color: '#166534',
    fontWeight: '700',
  },
  levelPending: {
    marginTop: 8,
    color: '#64748b',
    fontWeight: '600',
  },
  levelHeader: {
    gap: 4,
    marginBottom: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  levelHeading: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  levelSubheading: {
    color: '#475569',
    fontSize: 15,
  },
  exerciseCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  cardDefault: {
    borderColor: '#cbd5e1',
  },
  cardOk: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  cardBad: {
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
  },
  exerciseTitle: {
    color: '#334155',
    fontWeight: '700',
  },
  exercisePrompt: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputSmall: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  seriesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  symbolButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  symbolButtonSelected: {
    backgroundColor: '#0ea5e9',
  },
  symbolText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  symbolTextSelected: {
    color: '#ffffff',
  },
  correctAnswer: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  showAnswer: {
    color: '#0369a1',
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 4,
    backgroundColor: '#0284c7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  retryButton: {
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  scoreText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#15803d',
    marginTop: 2,
  },
});
