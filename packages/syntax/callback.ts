/**
 * Node style callback function.
 * @template T - type of result data.
 * @template E - type of error.
 */
export interface Callback<T = any, E = Error> {

    /**
     * Notify operation successful completion.
     */
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
    (error: void, result: T): void;
}
