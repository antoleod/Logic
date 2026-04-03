import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AppFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>Logic App · Contenido antiguo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
