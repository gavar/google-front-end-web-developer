/**
 * Represents function that listens for store modifications.
 */
export interface StoreListener<S = any> {
  /**
   * Occurs when store state changes.
   * @param state - current state of a store.
   */
  (state: Readonly<S>): void | Promise<void>;
}
