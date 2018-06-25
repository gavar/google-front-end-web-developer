/**
 * Node style completion notification.
 */
export interface Done<T = any, E = Error> {

    /** Notify operation successful completion. */
    (): void;

    /**
     * Notify operation failure.
     * @param error - error which provides reason of operation failure.
     */
    (error: E);

    /**
     * Notify operation success.
     * @param error - ignore
     * @param result - operation resulting data.
     */
    (error: never | void | null | 0 | false, result: T): void;
}

/**
 * Node style callback consumer.
 * @template T - type of result data.
 * @template E - type of error.
 */
export type Nodify<T = any, E = Error> = {
    (error: void | E, value: T): void;
};
