/**
 * Visibility Guard — pauses/resumes the Flash Anzan RAF loop
 * when the browser tab loses/regains focus.
 *
 * Plain TypeScript module — no React imports.
 * SSR-safe: guards against `document` access on the server.
 */

/**
 * Starts listening for visibility changes and pauses/resumes the RAF loop.
 *
 * @param stopLoop   - Called when tab becomes hidden; should cancel the RAF handle.
 * @param restartLoop - Called when tab becomes visible again; should restart the RAF loop
 *                      from the current sequence index.
 * @returns A cleanup function that removes the event listener. MUST be called on unmount.
 */
export function startVisibilityGuard(
  stopLoop: () => void,
  restartLoop: () => void
): () => void {
  if (typeof window === 'undefined') {
    // SSR — return no-op cleanup
    return () => {};
  }

  function handleVisibilityChange(): void {
    if (document.hidden) {
      stopLoop();
    } else {
      restartLoop();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
