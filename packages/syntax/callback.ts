type EmptyCallback = {
    /**
     * Notify operation successful completion.
     */
    (): void;
}

type ErrorCallback<E = Error> = {

    /**
     * Notify operation failure.
     * @param error - error which provides reason of operation failure.
     */
    (error: E);
}

type SuccessCallback<T = any, E = Error> = {
    /**
     * Notify operation success.
     * @param error - ignore
     * @param result - operation resulting data.
     */
    (error: void | Error, result: T): void;
}

/**
 * Node style callback function.
 * @template T - type of result data.
 * @template E - type of error.
 */
export type Callback<T = any, E = Error> = EmptyCallback | ErrorCallback<E> | SuccessCallback<T, E>;
