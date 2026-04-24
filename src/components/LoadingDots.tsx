import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function Dot({ delay, color }: { delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.6, duration: 280, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [scale, delay]);
  return <Animated.View style={[styles.dot, { backgroundColor: color, transform: [{ scale }] }]} />;
}

export default function LoadingDots({ color = '#fff' }: { color?: string }) {
  return (
    <View style={styles.row}>
      <Dot delay={0} color={color} />
      <Dot delay={160} color={color} />
      <Dot delay={320} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
