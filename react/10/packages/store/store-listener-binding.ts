import { Store } from "./store";
import { StoreListener } from "./store-listener";

/**
 * Represents store modifications binding.
 * Provides possibility to unsubscribe self by calling {@link StoreListenerBinding#destroy}.
 */
export interface StoreListenerBinding<S> {
  /** Listener to invoke when store state changes. */
  readonly listener: StoreListener<S>;
  /** Target to invoke listener on. */
  readonly target?: object;
  /** Unsubscribe listener from a store. */
  destroy(): void;
}

/**
 * Default implementation of {@link StoreListenerBinding}.
 */
export class DefaultStoreListenerBinding<S = any> implements StoreListenerBinding<S> {

  private store: Store<S>;

  /** @inheritDoc */
  public target?: any;

  /** @inheritDoc */
  public listener: StoreListener<S>;

  constructor(store: Store<S>, listener: StoreListener<S>, target?: object) {
    this.store = store;
    this.listener = listener;
    this.target = target;
  }

  /** @inheritDoc */
  destroy(): void {
    this.store.off(this.listener, this.target);
    this.clear();
  }

  /** Clear all fields. */
  clear(): void {
    this.store = null;
    this.target = null;
    this.listener = null;
  }
}
