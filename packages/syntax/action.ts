/**
 * Represents an operation that accepts no arguments and returns no result.
 */
export interface Action {
    (): void;
}

/**
 * Represents an operation that accepts one argument and returns no result.
 */
export interface Action1<T> {
    (arg: T): void;
}

/**
 * Represents an operation that accepts two arguments and returns no result.
 */
export interface Action2<T1, T2> {
    (arg1: T1, arg2: T2): void;
}
