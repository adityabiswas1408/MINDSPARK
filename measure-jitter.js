const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // The jitter test logic
  const result = await page.evaluate(async () => {
    // 1. The exact TimingEngine code from src/lib/anzan/timing-engine.ts
    const DELTA_CLAMP_FACTOR = 1.5;

    function startFlashLoop(state) {
      let animFrame;

      function loop(timestamp) {
        if (state.lastTimestamp === 0) {
          state.lastTimestamp = timestamp;
          animFrame = requestAnimationFrame(loop);
          return;
        }

        const delta = timestamp - state.lastTimestamp;
        state.lastTimestamp = timestamp;

        const clampedDelta = Math.min(delta, state.interval * DELTA_CLAMP_FACTOR);
        state.accumulator += clampedDelta;

        const tolerance = delta / 2;
        if (state.accumulator >= state.interval - tolerance) {
          const n = state.numbers[state.questionIndex];
          state.onFlash(n, false);
          state.accumulator -= state.interval;
          state.questionIndex++;

          if (state.questionIndex >= state.numbers.length) {
            state.onComplete();
            return;
          }
        }

        animFrame = requestAnimationFrame(loop);
      }

      state.lastTimestamp = 0;
      state.accumulator = 0;
      animFrame = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animFrame);
    }

    // 2. The Measurement Harness
    return new Promise((resolve) => {
      const timestamps = [];
      const interval = 500; // Realistic delay (500ms)
      const count = 10;     // 10 digits

      const state = {
        lastTimestamp: 0,
        accumulator: 0,
        questionIndex: 0,
        numbers: Array.from({ length: count }, (_, i) => i + 1),
        interval,
        onFlash: (n, isNeg) => {
          timestamps.push(performance.now());
        },
        onComplete: () => {
          // Compute deltas and jitter
          const deltas = [];
          for (let i = 1; i < timestamps.length; i++) {
            deltas.push(timestamps[i] - timestamps[i - 1]);
          }

          let maxJitter = 0;
          let totalJitter = 0;

          const rawDeltas = [];

          for (const delta of deltas) {
            rawDeltas.push(delta);
            const jitter = Math.abs(delta - interval);
            totalJitter += jitter;
            if (jitter > maxJitter) {
              maxJitter = jitter;
            }
          }

          const avgJitter = totalJitter / deltas.length;
          
          resolve({
            maxJitter,
            avgJitter,
            rawDeltas
          });
        }
      };

      startFlashLoop(state);
    });
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
