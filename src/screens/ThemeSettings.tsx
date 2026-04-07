import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const options: { key: 'system' | 'light' | 'dark' | 'amoled'; label: string }[] = [
  { key: 'system', label: 'System Default' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'amoled', label: 'AMOLED Black' },
];

export function ThemeSettings() {
  const { colors, spacing, typography, themeName, setTheme } = useTheme();
  const styles = createStyles(colors, spacing, typography);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme</Text>
      <View style={styles.list}>
        {options.map(opt => {
          const selected = themeName === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setTheme(opt.key)}
              style={[styles.item, selected ? { borderColor: colors.primary } : null]}
              activeOpacity={0.7}
            >
              <Text style={styles.itemLabel}>{opt.label}</Text>
              <View style={[styles.dot, selected ? { backgroundColor: colors.primary } : null]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(c: any, s: any, t: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, padding: s.md },
    title: { ...t.h2, marginBottom: s.md },
    list: {},
    item: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      padding: s.md,
      marginBottom: s.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemLabel: { ...t.body1 },
    dot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: 'transparent',
    },
  });
}
