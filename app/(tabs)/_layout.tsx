import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: '#dbeafe',
          borderTopWidth: 1,
          backgroundColor: '#ffffff',
        },
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Aritmetica' }} />
      <Tabs.Screen name="explore" options={{ title: 'Logica' }} />
    </Tabs>
  );
}
