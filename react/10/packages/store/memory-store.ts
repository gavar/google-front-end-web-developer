import { AbstractStore } from "./abstract-store";
import { StateUpdater } from "./state-updater";

/**
 * Store which keeps state in memory.
 */
export class MemoryStore<S = object> extends AbstractStore<S> {

  /** @inheritDoc */
  readonly state: Readonly<S> = {} as S;

  /** @inheritDoc */
  setState(next: Partial<S>): void | Promise<void>;

  /** @inheritDoc */
  setState(updater: StateUpdater<S>): void | Promise<void>;

  /** @private */
  setState(state: Partial<S> | StateUpdater<S>): void | Promise<void> {
    // resolve next state
    switch (typeof state) {
      case "function":
        state = (state as StateUpdater<S>)(this.state);
        break;
    }

    // assign new state
    if (state != null)
      Object.assign(this.state, state);

    // notify subscribers even if null provided as a next state
    // this allows to pass null as state to trigger notifications
    return this.notify(this.state);
  }
}
