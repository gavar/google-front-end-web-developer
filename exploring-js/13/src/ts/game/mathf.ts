/**
 * Randomization library.
 */
export class Random {

    /**
     * Get random number within given range.
     * @param min - minimum number inclusive.
     * @param max - maximum number exclusive.
     */
    public static range(min: number, max: number): number {
        return min + (max - min) * Math.random();
    }

    /**
     * Get random integer number within given range.
     * @param min - minimum number inclusive.
     * @param max - maximum number exclusive.
     */
    public static rangeInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return min + Math.floor((max - min) * Math.random());
    }

    /**
     * Get random deviation within given tolerance.
     * @param {number} tolerance - maximum offset from 1.
     */
    public static deviation(tolerance: number): number {
        return 1 + (Math.random() - 0.5) * 2 * tolerance;
    }
}

/**
 * Math functions library.
 */
export class Mathf {

}
