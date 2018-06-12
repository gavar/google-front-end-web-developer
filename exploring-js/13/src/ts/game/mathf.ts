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

    /** Shuffle array of items. */
    public static shuffle<T>(array: T[]) {
        let temp, j;
        for (let i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}

/**
 * Math functions library.
 */
export class Mathf {

    /**
     * Gradually change towards a destination value over time.
     * @param now - current value.
     * @param to - destination value.
     * @param velocityObject - container storing current velocity value (modified by this func).
     * @param velocityKey - name of the property in container to use for storing velocity value.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - time since last call of this function.
     * @return value to apply to current value.
     * @see https://github.com/Unity-Technologies/UnityCsReference/blob/11bcfd801fccd2a52b09bb6fd636c1ddcc9f1705/Runtime/Export/Mathf.cs#L303
     */
    public static smooth(now: number, to: number, velocityObject: object, velocityKey: string, smoothTime: number, deltaTime: number): number {
        const o = 2 / smoothTime;
        const x = o * deltaTime;
        const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

        const delta = now - to;
        const destination = to;

        to = now - delta;

        let velocity = velocityObject[velocityKey];
        let temp = (velocity + o * delta) * deltaTime;
        velocity = (velocity - o * temp) * e;
        let next = to + (delta + temp) * e;

        if (destination - now > 0 === next > destination) {
            next = destination;
            velocity = (next - destination) / deltaTime;
        }

        velocityObject[velocityKey] = velocity;
        return next;
    }
}
