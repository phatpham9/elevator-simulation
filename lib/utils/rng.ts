// Seedable random number generator using mulberry32
export class SeededRNG {
  private seed: number

  constructor(seed: number = Date.now()) {
    this.seed = seed
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  poisson(lambda: number): number {
    if (lambda <= 0) return 0
    const L = Math.exp(-lambda)
    let k = 0
    let p = 1
    do {
      k++
      p *= this.next()
    } while (p > L)
    return k - 1
  }

  reset(seed: number) {
    this.seed = seed
  }
}
