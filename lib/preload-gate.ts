/**
 * Client-side gate between the preloader and the hero intro.
 *
 * HeroMotion subscribes and holds its intro timeline until the preloader
 * lifts its curtain, so the reveal is seamless. The preloader calls
 * releasePreloadGate() as the curtain starts moving. Modules are fresh per
 * full page load, which is exactly the preloader's lifetime.
 */

let released = false;
const listeners = new Set<() => void>();

export function releasePreloadGate() {
  if (released) return;
  released = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function isPreloadGateReleased() {
  return released;
}

export function onPreloadGateRelease(fn: () => void): () => void {
  if (released) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
