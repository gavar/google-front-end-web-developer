/**
 * Event signature definition.
 */
export interface EventType<T = void> extends String {

}

/**
 * Represents event listener function.
 */
export interface EventListener<T = void> {
    (event: T, type: string): void;
}

/**
 * Provides possibility produce and observe events.
 */
export class EventEmitter {

    private lock: number = 0;
    private bindings: EventBinding[] = [];

    /**
     * Adds the {@param listener} function to the end of the listeners array for for the event identified by {@param type}.
     * Multiple calls with same combination of {@param type} and {@param listener} will result in the listener being added multiple times.
     * @param type - identifies the event to invoke listeners for.
     * @param listener - listener function to call whenever event occurs.
     * @param target - target to invoke listener on.
     */
    on<T>(type: EventType<T>, listener: EventListener<T>, target?: object): void {
        this.bindings.push({type, listener, target});
    }

    /**
     * Synchronously calls each of the listeners registered for the event identified by {@param type}.
     * Listener invocation occurs in the order they were registered, passing the supplied {@link event} to each.
     *
     * @param type - identifies the event to invoke listeners for.
     * @param event - event data to supply for each event listener.
     */
    emit<T>(type: EventType<T>, event?: T): void {
        // find index of first match
        let index = 0;
        for (; index < this.bindings.length; index++)
            if (this.bindings[index].type === type)
                break;

        // exit if no match
        if (index >= this.bindings.length)
            return;

        // initialize args
        const args = [event, type];

        // dispatch
        try {
            this.lock++;
            for (; index < this.bindings.length; index++) {
                const binding = this.bindings[index];
                if (binding.type === type)
                    binding.listener.apply(binding.target, args);
            }
        }
        finally {
            this.lock--;
            if (!this.lock)
                this.cleanup();
        }
    }

    /***
     * Removes listener previously registered for same event, callback and target.
     * @param type - identifies the event being removed.
     * @param listener - listener function to remove.
     * @param target - target of the listener function; if it's not given, only listener without target will be removed.
     */
    off<T>(type: EventType<T>, listener: EventListener<T>, target?: object): void {
        for (let i = 0; i < this.bindings.length; i++) {
            const binding = this.bindings[i];
            if (binding.type !== type) continue;
            if (binding.listener !== listener) continue;
            if (binding.target !== target) continue;
            this.bindings[i] = null;
        }

        if (!this.lock)
            this.cleanup();
    }

    /** Removes all events listeners. */
    public removeAllListeners() {
        this.bindings.length = 0;
    }

    private cleanup() {
        for (let i = 0; i < this.bindings.length; i++) {
            if (this.bindings[i]) continue;
            const last = this.bindings.pop();
            if (i < this.bindings.length)
                this.bindings[i] = last;
        }
    }
}

interface EventBinding {
    type: EventType<any>;
    listener: EventListener<any>;
    target: object;
}
