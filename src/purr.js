let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playPurr() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 0.7;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gainNode = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(28, now);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(56, now);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(26, now);
  lfoGain.gain.setValueAtTime(8, now);

  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.setValueAtTime(0.3, now + duration - 0.15);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  lfo.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  lfo.stop(now + duration);
}
