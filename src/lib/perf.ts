/**
 * Performance monitoring tools & dev benchmarks
 */

let fps = 60;
let frameCount = 0;
let lastTime = performance.now();
let fpsListener: ((fps: number) => void) | null = null;
let isFpsTracking = false;

export function startFpsMeter(callback: (currentFps: number) => void) {
  fpsListener = callback;
  if (isFpsTracking) return;
  isFpsTracking = true;

  function loop(currentTime: number) {
    frameCount++;
    if (currentTime - lastTime >= 500) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
      if (fpsListener) {
        fpsListener(fps);
      }
    }
    if (isFpsTracking) {
      requestAnimationFrame(loop);
    }
  }

  requestAnimationFrame(loop);
}

export function stopFpsMeter() {
  isFpsTracking = false;
  fpsListener = null;
}

export function markStart(name: string) {
  if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
    performance.mark(`${name}-start`);
  }
}

export function markEnd(name: string): number {
  if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
    const endMark = `${name}-end`;
    const startMark = `${name}-start`;
    performance.mark(endMark);
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      const latest = entries[entries.length - 1];
      return latest ? latest.duration : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}
