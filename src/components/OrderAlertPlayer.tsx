import React from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useVendorStore } from '../store/vendorStore';

export default function OrderAlertPlayer() {
  const shouldPlay = useVendorStore(state => state.pendingAlertIds.size > 0);

  if (!shouldPlay) return null;

  return (
    <Video
      source={require('../assets/sounds/order_alert.mp3')}
      repeat
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
