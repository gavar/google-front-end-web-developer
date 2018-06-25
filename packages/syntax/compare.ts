/**
 * Represents value comparison function.
 */
export interface Compare<T = any> {
    /**
     * Compare two objects of the same type.
     * - when returns value < 0, then a < b
     * - when returns value > 0, then a > b
     * - otherwise values are equal.
     * @param a - first objects to compare.
     * @param b - second object to compare.
     */
    (a: T, b: T): number;
}
