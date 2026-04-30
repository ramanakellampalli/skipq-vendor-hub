import Sound from 'react-native-sound';

Sound.setCategory('Alarm', true);

let _sound: Sound | null = null;
let _playing = false;

function load(): Promise<Sound> {
  return new Promise((resolve, reject) => {
    const s = new Sound('order_alert.mp3', Sound.MAIN_BUNDLE, err => {
      if (err) reject(err);
      else resolve(s);
    });
  });
}

export const orderAlert = {
  async start(): Promise<void> {
    if (_playing) return;
    try {
      if (!_sound) {
        _sound = await load();
      }
      _sound.setNumberOfLoops(-1);
      _sound.play();
      _playing = true;
    } catch {
      // sound file missing — fail silently, vibration still works
    }
  },

  stop(): void {
    if (!_playing || !_sound) return;
    _sound.stop();
    _playing = false;
  },
};
