// Deterministic randomness. Ported from the idea of the procedural-generation skill's seeds.py:
// stable string hashing (FNV-1a 32-bit) + a small, specified PRNG (mulberry32), one named stream per subsystem.
// Never use Math.random() in the generator.

export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mix(a, b) {
  // combine two 32-bit ints (murmur3 finaliser style)
  let h = (a ^ Math.imul(b + 0x9e3779b9, 0x85ebca6b)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export class Rng {
  constructor(seed) { this.s = seed >>> 0; }
  next() { // mulberry32 -> [0,1)
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); } // inclusive
  range(lo, hi) { return lo + this.next() * (hi - lo); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  // weighted pick: items = [[value, weight], ...] or object {value: weight}
  weighted(items) {
    const list = Array.isArray(items) ? items : Object.entries(items);
    let total = 0;
    for (const [, w] of list) total += Math.max(0, w);
    if (total <= 0) return list[0][0];
    let r = this.next() * total;
    for (const [v, w] of list) { r -= Math.max(0, w); if (r < 0) return v; }
    return list[list.length - 1][0];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  sample(arr, k) { return this.shuffle(arr).slice(0, k); }
}

// A named sub-stream: same (seed, name) -> same sequence, independent of every other stream.
export function stream(seed, ...names) {
  let h = mix(hashString(String(seed)), 0x2545f491);
  for (const n of names) h = mix(h, hashString(String(n)));
  return new Rng(h);
}

// Normalise free-text or numeric seeds to a string key.
export function normSeed(seed) {
  return String(seed ?? '0').trim() || '0';
}
