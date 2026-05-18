import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 60;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  color: string;
}

const COLORS = ['#00f5ff', '#ff00ff', '#7b2fff', '#ffffff', '#e0e0ff'];

function createStar(): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 0.5,
    opacity: new Animated.Value(Math.random()),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function animateStar(star: Star) {
  const duration = 1500 + Math.random() * 3000;
  Animated.sequence([
    Animated.timing(star.opacity, {
      toValue: Math.random() * 0.9 + 0.1,
      duration: duration / 2,
      useNativeDriver: true,
    }),
    Animated.timing(star.opacity, {
      toValue: Math.random() * 0.3,
      duration: duration / 2,
      useNativeDriver: true,
    }),
  ]).start(() => animateStar(star));
}

export default function StarField() {
  const stars = useRef<Star[]>([]);

  if (stars.current.length === 0) {
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.current.push(createStar());
    }
  }

  useEffect(() => {
    stars.current.forEach(s => animateStar(s));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.current.map((star, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: star.color,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}
