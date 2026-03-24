export async function initStorageProbe(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.storage) return;

  try {
    // 1. Always request persistence on init — not conditional on storage level
    if (navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const granted = await navigator.storage.persist();
        if (!granted) {
          console.warn('[StorageProbe] Persistent storage denied — offline queue may be evicted by browser.');
        }
      }
    }

    // 2. Check available space and warn if below 500MB (spec minimum)
    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const availableBytes = (estimate.quota ?? 0) - (estimate.usage ?? 0);
      const availableMB = availableBytes / (1024 * 1024);

      if (availableMB < 500) {
        console.warn(
          `[StorageProbe] Available storage ~${Math.round(availableMB)}MB — ` +
          `below recommended 500MB minimum. Offline exam queue may fail on long exams.`
        );
      }
    }
  } catch (error) {
    console.error('[StorageProbe] Storage probe failed:', error);
  }
}
