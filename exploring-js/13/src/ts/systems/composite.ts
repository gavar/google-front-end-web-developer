import {Bag, System} from "$engine";

/** Represents component composition. */
export interface Composition<T> {
    /** Primary component added tracked by a system. */
    component: T;
}

/**
 * Base class for which require to work with multiple components at the same time.
 */
export abstract class CompositeSystem<T, C extends Composition<T>> implements System<T> {

    protected readonly compositions: C[] = [];
    protected readonly indexer: Map<T, number> = new Map<T, number>();

    /** @inheritDoc */
    abstract match(component: T): component is T;

    /** @inheritDoc */
    add(component: T): void {
        if (this.indexer.has(component))
            return;

        const index = this.compositions.length;
        const composition = this.compose(component, index);
        this.indexer.set(composition.component, index);
        this.compositions.push(composition);
    }

    /** @inheritDoc */
    remove(component: T): void {
        const {indexer} = this;
        const index = indexer.get(component);
        if (typeof index === "undefined")
            return;

        // remove from indexer
        indexer.delete(component);

        // fill empty slot with last component
        const {compositions} = this;
        if (Bag.removeAt(compositions, index))
            indexer.set(compositions[index].component, index);
    }

    /** @inheritDoc */
    tick(deltaTime: number): void {
        this.process(deltaTime, this.compositions);
    }

    /**
     * Create new composition instance from given component.
     * @param component - primary component of the composition.
     * @param index - zero-based index of the component.
     */
    protected abstract compose(component: T, index: number): C;

    /**
     * Process components.
     * @param deltaTime - time since last frame.
     * @param compositions - list of component compositions to process.
     */
    protected abstract process(deltaTime: number, compositions: ReadonlyArray<C>): void;
}
