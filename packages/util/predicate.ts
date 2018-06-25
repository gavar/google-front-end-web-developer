/**
 * Represents function that defines a set of criteria and determines whether the specified object meets those criteria.
 */
export interface Predicate<T> {
    /**
     * Invoke predicate to determines whether the specified object meets criteria.
     * @param item - object to compare against the criteria.
     * @return {@code true} if obj meets the criteria defined; otherwise {@code false}.
     */
    (item: T): boolean;
}

/** Whether given item is a number. */
export function isNumber(item: any): item is number {
    return typeof item === "number";
}

/** Whether given item is a finite number. */
export function isFiniteNumber(item: any): item is number {
    return typeof item === "number" && isFinite(item);
}

/** Whether given item is a string. */
export function isString(item: any): item is string {
    return typeof item === "string";
}

/** Whether given item is an array. */
export const isArray: <T>(item: T[]) => item is T[] = Array.isArray;

/**
 * Predicate that returns {@code true} if value evaluates to {@code false}.
 *
 * return {@code true} when:
 * {@code false}
 * {@code null}
 * {@code undefined}
 * {@code 0}
 * {@code ""}
 * {@code NaN}
 */
export function isFalsy<T>(item: T): boolean {
    return !item;
}

/**
 * Predicate that returns {@code true} if value evaluates to {@code true}.
 *
 * return {@code false} when:
 * {@code false}
 * {@code null}
 * {@code undefined}
 * {@code 0}
 * {@code ""}
 * {@code NaN}
 */
export function isTruthy<T>(item: T): boolean {
    return !!item;
}
