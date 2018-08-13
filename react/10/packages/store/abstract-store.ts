import { StateUpdater } from "./state-updater";
import { Store } from "./store";
import { StoreListener } from "./store-listener";
import { DefaultStoreListenerBinding, StoreListenerBinding } from "./store-listener-binding";

/**
 * Promise which is always resolved.
 * Only for optimizations, since {@link Promise#resolve} always returns new instance.
 */
const RESOLVE = Promise.resolve();

/**
 * Default store which keeps state in memory.
 * Abstract store providing subscription functionality.
 */
export abstract class AbstractStore<S = object> implements Store<S> {

  protected readonly bindings: DefaultStoreListenerBinding[] = [];

  /** @inheritDoc */
  abstract readonly state: Readonly<S>;

  /** @inheritDoc */
  abstract setState(state: Partial<S>): void | Promise<void>;

  /** @inheritDoc */
  abstract setState(updater: StateUpdater<S>): void | Promise<void>;

  /** @inheritDoc */
  on(listener: StoreListener<S>, target?: object): StoreListenerBinding<S> {
    const binding = new DefaultStoreListenerBinding(this, listener, target);
    this.bindings.push(binding);
    return binding;
  }

  /** @inheritDoc */
  off(listener: StoreListener<S>, target?: object): void {
    const bindings = this.bindings;
    for (let i = 0, size = bindings.length; i < size; i++) {
      const binding = bindings[i];
      if (binding.listener !== listener) continue;
      if (binding.target !== target) continue;
      bindings.splice(i, 1);
      binding.clear();
      return;
    }
  }

  /**
   * Notify subscribers that state has been changed.
   * @param state - current state of the store.
   */
  protected notify(state: Readonly<S>): Promise<void> {

    let size = 0;
    let promises: any | any[];

    for (const binding of this.bindings) {
      try {
        // notify subscribers
        const {listener, target} = binding;
        const promise = listener.apply(target, arguments) as Promise<void>;

        // accumulate promises
        if (promise && promise.then)
          switch (size++) {
            case 0:
              promises = promise;
              break;
            case 1:
              promises = [promises, promise];
              break;
            default:
              promises.push(promise);
              break;
          }
      }
      catch (e) {
        console.error(e);
      }
    }

    // do not create promise until required
    if (size < 1) return RESOLVE;
    if (size < 2) return promises;
    return Promise.all<void>(promises as any[]) as any;
  }
}
