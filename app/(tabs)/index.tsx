import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFooter } from '@/components/app-footer';
import { levels } from '@/data/exerciseData';

const OLD_LEVEL_IDS = new Set([1, 2]);
const ARITHMETIC_TYPES = new Set(['sum', 'subtract', 'decomposition', 'comparison', 'wordProblem']);

export default function ArithmeticTab() {
  const items = useMemo(
    () =>
      levels
        .filter((level) => OLD_LEVEL_IDS.has(level.id))
        .flatMap((level) =>
          level.exercises
            .filter((exercise) => ARITHMETIC_TYPES.has(exercise.type))
            .map((exercise) => ({
              key: `${level.id}-${exercise.id}`,
              level: level.title,
              prompt: exercise.prompt,
              type: exercise.type,
            }))
        ),
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Aritmetica</Text>
      <Text style={styles.subtitle}>Solo contenido antiguo (Nivel 1 y 2)</Text>

      {items.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.level}>{item.level}</Text>
          <Text style={styles.prompt}>{item.prompt}</Text>
          <Text style={styles.type}>Tema: {item.type}</Text>
        </View>
      ))}

      <AppFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 12,
    gap: 6,
  },
  level: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 12,
  },
  prompt: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  type: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
