// Deterministic PRNG so the simulated response base is stable across loads.
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffled = <T,>(items: T[], rand: () => number): T[] => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Expand {optionKey: count} into a shuffled column of option keys of length n. */
export const columnFromCounts = (counts: Record<string, number>, rand: () => number): string[] => {
  const col: string[] = [];
  for (const [key, count] of Object.entries(counts)) for (let i = 0; i < count; i++) col.push(key);
  return shuffled(col, rand);
};
