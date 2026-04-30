import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useVendorStore } from '../store/vendorStore';

const REPEAT_INTERVAL_MS = 3000;

export default function OrderAlertPlayer() {
  const shouldPlay = useVendorStore(state => state.pendingAlertIds.size > 0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!shouldPlay) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPaused(false);
    }
  }, [shouldPlay]);

  const onEnd = useCallback(() => {
    setPaused(true);
    timerRef.current = setTimeout(() => setPaused(false), REPEAT_INTERVAL_MS);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!shouldPlay) return null;

  return (
    <Video
      source={require('../assets/sounds/order_alert.wav')}
      paused={paused}
      onEnd={onEnd}
      playInBackground
      playWhenInactive
      ignoreSilentSwitch="ignore"
      style={styles.hidden}
    />
  );
}

const styles = StyleSheet.create({
  hidden: { height: 0, width: 0, position: 'absolute' },
});
