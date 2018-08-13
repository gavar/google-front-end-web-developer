import { StateUpdater } from "./state-updater";
import { StoreListener } from "./store-listener";
import { StoreListenerBinding } from "./store-listener-binding";

/**
 * Store holds the state tree of specific domain.
 */
export interface Store<S = object> {

  /** Gets value of the current state. */
  readonly state: Readonly<S>;

  /**
   * Notify store that state tree has been changed.
   * @param none - placeholder for any value equivalent to null.
   * @returns promise which waits until all subscribers has been notified.
   */
  setState(none?: null): void | Promise<void>;

  /**
   * Modify state of the store so the active state will be merged with the provided state.
   * @param state - state to merge current state with.
   * @returns promise which waits until all subscribers has been notified.
   */
  setState(state: Partial<S>): void | Promise<void>;

  /**
   * Modify state by using return value of the given updater function.
   * NOTE: this is not preferable way of modifying state since it generates
   * @param updater - function that returns new state to merge current state with.
   * @returns promise which waits until all subscribers has been notified.
   */
  setState(updater: StateUpdater<S>): void | Promise<void>;

  /**
   * Subscribe listener for store state modifications.
   * @param listener - listener that handles store modifications.
   * @param target - target to invoke listener on.
   */
  on(listener: StoreListener<S>, target?: object): StoreListenerBinding<S>;

  /**
   * Removes listener previously registered for a store state modifications.
   * @param listener - listener function to remove.
   * @param target - target of the listener function; if it's not given, only listener without target will be removed.
   */
  off(listener: StoreListener<S>, target?: object): void;
}
