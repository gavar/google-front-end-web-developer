/***
 * Represents function that provides state modification based on previous state.
 */
export interface StateUpdater<S = any> {
  /**
   * Calculate state to apply to a store.
   * @param  prev - previous store state.
   * @returns state to merge into a store.
   */
  (prev: Readonly<S>): Partial<S>;
}
