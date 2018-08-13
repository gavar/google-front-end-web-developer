/**
 * Function that returns same value that is used as the argument.
 * Handy to use as a stub or a filter for values that should evaluate to true.
 */
export function identity<T>(value: T): T {
    return value;
}
