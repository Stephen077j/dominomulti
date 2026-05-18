import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface SectionTabProps {
  tabs: string[];
  selected: number;
  onSelect: (i: number) => void;
}

export default function SectionTab({ tabs, selected, onSelect }: SectionTabProps) {
  const colors = useColors();
  return (
    <View style={[styles.wrapper, { borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {tabs.map((t, i) => {
          const active = i === selected;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => onSelect(i)}
              style={[
                styles.tab,
                { borderColor: active ? colors.neonCyan : 'transparent', backgroundColor: active ? 'rgba(0,245,255,0.1)' : 'transparent' },
              ]}
            >
              <Text style={[styles.label, { color: active ? colors.neonCyan : colors.mutedForeground }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
