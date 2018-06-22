import {Layer} from "$/components";
import {Component} from "$/engine";
import {CompositeSystem, Composition} from "$/systems";
import {Mutable} from "@syntax";

export interface Sortable extends Component {
    /**
     * Sorting order of the component within the same layer.
     * @see Layer#value
     */
    readonly order?: number;
}

/** Composition entry of {@link SortSystem}. */
export interface SortComposition<T> extends Composition<T> {
    /** Actor layer. */
    readonly layer: Layer;

    /** Zero-based index of the component within a system to preserve sorting order. */
    readonly index: number;
}

/**
 * Base class for systems that require to process components in proper sorting order.
 */
export abstract class SortSystem<T extends Sortable, C extends SortComposition<T> = SortComposition<T>> extends CompositeSystem<T, C> {

    /** @inheritDoc */
    tick(deltaTime: number): void {
        // sort components
        const {compositions} = this;
        compositions.sort(this.compare);

        // prepare
        for (let i = 0, size = this.compositions.length; i < size; i++) {
            const composition: Mutable<C> = compositions[i];
            // update order if changed while sort
            if (composition.index !== i) {
                composition.index = i;
                this.indexer.set(composition.component, i);
            }
        }

        // process
        this.process(deltaTime, compositions);
    }

    /** Compare two entries by sorting layer, order and z-index. */
    compare(a: SortComposition<T>, b: SortComposition<T>): number {
        return a.layer.value - b.layer.value
            || ~b.component.order - ~a.component.order
            || a.index - b.index
            ;
    }

    /** @inheritDoc */
    protected compose(component: T, index: number): C {
        return {
            index,
            component,
            layer: component.actor.require(Layer),
        } as C;
    }
}
