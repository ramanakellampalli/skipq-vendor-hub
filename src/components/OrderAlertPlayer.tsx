import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useVendorStore } from '../store/vendorStore';

const TONE_DURATION_MS = 1100;
const REPEAT_INTERVAL_MS = 3000;
const CYCLE_MS = TONE_DURATION_MS + REPEAT_INTERVAL_MS;

export default function OrderAlertPlayer() {
  const shouldPlay = useVendorStore(state => state.pendingAlertIds.size > 0);
  const [playKey, setPlayKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!shouldPlay) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setPlayKey(k => k + 1);
    intervalRef.current = setInterval(() => setPlayKey(k => k + 1), CYCLE_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [shouldPlay]);

  if (!shouldPlay) return null;

  return (
    <Video
      key={playKey}
      source={require('../assets/sounds/order_alert.wav')}
      paused={false}
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
