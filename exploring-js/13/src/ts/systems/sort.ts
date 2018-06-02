import {Sort} from "$components";
import {Component, System} from "$engine";

export interface Sortable extends Component {
    /**
     * Sorting order of the component within same sorting layer.
     * @see Sort#layer
     */
    readonly order?: number;
}

/**
 * Base class for systems that require to process components in proper sorting order.
 */
export abstract class SortSystem<T extends Sortable> implements System<T> {

    private static readonly buffer: any[] = [];
    private readonly entries: SortEntry<T>[] = [];
    private readonly indexer: Map<T, number> = new Map<T, number>();

    /** @inheritDoc */
    abstract match(component: T): component is T;

    /** @inheritDoc */
    add(component: T): void {
        if (this.indexer.has(component))
            return;

        const entry: SortEntry<T> = {
            component,
            sort: component.actor.require(Sort),
            order: this.entries.length,
        };
        this.indexer.set(component, this.entries.length);
        this.entries.push(entry);
    }

    /** @inheritDoc */
    remove(component: T): void {
        const index = this.indexer.get(component);
        if (typeof index === "undefined")
            return;

        this.indexer.delete(component);

        // fill empty slot with last component
        const last = this.entries.pop();
        if (index < this.entries.length) {
            this.entries[index] = last;
            this.indexer.set(last.component, index);
        }
    }

    /** @inheritDoc */
    tick(deltaTime: number): void {
        // sort components
        const items = this.entries;
        items.sort(this.compare);

        const buffer = SortSystem.buffer;
        try {
            buffer.length = this.entries.length;

            // prepare
            for (let i = 0, size = this.entries.length; i < size; i++) {
                const entry = items[i];
                // copy to buffer for processing
                buffer[i] = entry.component;
                // update order if changed while sort
                if (entry.order !== i) {
                    entry.order = i;
                    this.indexer.set(entry.component, i);
                }
            }

            // process
            this.process(deltaTime, buffer);
        }
        finally {
            buffer.length = 0;
        }
    }

    /** Compare two entries by sorting layer, order and z-index. */
    compare(a: SortEntry<T>, b: SortEntry<T>): number {
        return a.sort.layer - b.sort.layer
            || ~b.component.order - ~a.component.order
            || a.order - b.order
            ;
    }

    /**
     * Process components.
     * @param deltaTime - time since last frame.
     * @param components - list of components to process.
     */
    protected abstract process(deltaTime: number, components: ReadonlyArray<T>): void;
}

export interface SortEntry<T> {
    sort: Sort;
    order: number;
    component: T;
}
