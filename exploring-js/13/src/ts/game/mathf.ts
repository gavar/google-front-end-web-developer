/**
 * Math functions library.
 */
export class Mathf {

    /**
     * Get random integer number within given range.
     * @param min - minimum number inclusive.
     * @param max - maximum number inclusive.
     */
    public static randomRangeInt(min: number, max: number): number {
        return min + Math.floor(((max - min) * Math.random()) + 0.5);
    }
}
