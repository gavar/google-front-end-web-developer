/**
 * Represents task callback function.
 */
export interface TaskCallback {

    /**
     * Notify that task completed successfully, but did not return result.
     */
    (): void;

    /**
     * Notify that task completed with error.
     * @param error - reason that defines why task failed.
     */
    (error: any): void;

    /**
     * Notify that task completed successfully and returned result.
     * @param error - should always be void.
     * @param result - task execution result.
     */
    (error: void, result: any): void;
}
