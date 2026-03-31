const audio = new Audio('/purr.mp3');
audio.preload = 'auto';

let fadeTimer: ReturnType<typeof setInterval> | null = null;

export function playPurr(): void {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }

  audio.currentTime = 0;
  audio.volume = 1;
  audio.play();

  const fadeStart = 1000;
  const fadeDuration = 500;
  const fadeSteps = 20;
  const stepMs = fadeDuration / fadeSteps;

  setTimeout(() => {
    let step = 0;
    fadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, 1 - step / fadeSteps);
      if (step >= fadeSteps) {
        clearInterval(fadeTimer!);
        fadeTimer = null;
        audio.pause();
      }
    }, stepMs);
  }, fadeStart);
}
