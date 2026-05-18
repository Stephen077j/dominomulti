import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'operator' | 'function' | 'special' | 'equals' | 'danger';
  style?: ViewStyle;
  labelStyle?: object;
  disabled?: boolean;
  small?: boolean;
}

const VARIANTS = {
  default: { bg: 'rgba(16,16,40,0.9)', border: 'rgba(0,245,255,0.3)', text: '#e0e0ff', glow: '#00f5ff' },
  operator: { bg: 'rgba(0,245,255,0.12)', border: '#00f5ff', text: '#00f5ff', glow: '#00f5ff' },
  function: { bg: 'rgba(123,47,255,0.15)', border: 'rgba(123,47,255,0.6)', text: '#c0a0ff', glow: '#7b2fff' },
  special: { bg: 'rgba(255,0,255,0.12)', border: 'rgba(255,0,255,0.5)', text: '#ff00ff', glow: '#ff00ff' },
  equals: { bg: 'rgba(0,255,136,0.2)', border: '#00ff88', text: '#00ff88', glow: '#00ff88' },
  danger: { bg: 'rgba(255,68,85,0.15)', border: 'rgba(255,68,85,0.5)', text: '#ff4455', glow: '#ff4455' },
};

export default function NeonButton({ label, onPress, variant = 'default', style, labelStyle, disabled, small }: NeonButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const v = VARIANTS[variant];

  function handlePressIn() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 0 }),
      Animated.timing(glow, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
  }
  function handlePressOut() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 3 }),
      Animated.timing(glow, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }

  const shadowStyle = Platform.OS === 'ios'
    ? {
        shadowColor: v.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glow,
        shadowRadius: 8,
      }
    : {};

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style, shadowStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.btn,
          small && styles.btnSmall,
          {
            backgroundColor: disabled ? 'rgba(20,20,40,0.5)' : v.bg,
            borderColor: disabled ? 'rgba(100,100,140,0.3)' : v.border,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            small && styles.labelSmall,
            { color: disabled ? '#555577' : v.text },
            labelStyle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 6,
  },
  btnSmall: {
    minHeight: 38,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 12,
  },
});
