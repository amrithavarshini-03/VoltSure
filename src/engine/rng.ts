/**
 * Mulberry32 seeded PRNG for deterministic, reproducible Monte Carlo simulations.
 */
export class SeededRNG {
  private s: number;

  constructor(seed: number = 42) {
    this.s = seed | 0;
  }

  /**
   * Generates a floating point number in [0, 1)
   */
  next(): number {
    this.s = (this.s + 0x6D2B79F5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a standard normal random variable using Box-Muller transform
   */
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u1 = this.next();
    let u2 = this.next();
    // Avoid log(0)
    while (u1 === 0) u1 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Generates a log-normally distributed positive multiplier with median 1.0
   * such that log(X) ~ N(0, sigma^2)
   */
  nextLogNormal(sigma: number): number {
    const g = this.nextGaussian(0, sigma);
    return Math.exp(g);
  }
}

