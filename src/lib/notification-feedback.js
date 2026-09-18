let audioContext;
let soundConsumers = 0;

const getAudioContext = () => {
  if (audioContext) return audioContext;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  audioContext = new AudioContext();
  return audioContext;
};

const unlockAudio = () => {
  const context = getAudioContext();
  if (context?.state === "suspended") void context.resume();
};

export const enableNotificationSound = () => {
  soundConsumers += 1;
  if (soundConsumers === 1) {
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
  }

  return () => {
    soundConsumers = Math.max(0, soundConsumers - 1);
    if (soundConsumers === 0) {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    }
  };
};

const playChime = (context) => {
  const startedAt = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startedAt);
  gain.gain.exponentialRampToValueAtTime(0.16, startedAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.42);
  gain.connect(context.destination);

  [659.25, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const noteStart = startedAt + index * 0.09;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    oscillator.connect(gain);
    oscillator.start(noteStart);
    oscillator.stop(startedAt + 0.42);
  });
};

export const playNotificationSound = () => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context.resume().then(() => playChime(context)).catch(() => {});
    return;
  }

  playChime(context);
};
