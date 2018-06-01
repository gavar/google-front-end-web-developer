import {Sort} from "$components";
import {Component, System} from "$engine";

export interface Draw2D extends Component {

    /**
     * Sorting order of the component within same sorting layer.
     * @see Sort#layer
     */
    readonly order?: number;

    /**
     * Render component on a given 2D context.
     * @param ctx - 2D canvas rendering context to render on.
     */
    draw2D(ctx: CanvasRenderingContext2D): void
}

/**
 * System which draws components on a canvas.
 */
export class DrawSystem implements System<Draw2D> {

    private size: number = 0;
    private readonly array: DrawEntry[] = [];
    private readonly indexer: Map<Draw2D, number> = new Map<Draw2D, number>();

    private readonly canvas: HTMLCanvasElement;
    private readonly context2D: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context2D = this.canvas.getContext("2d");
    }

    /** @inheritDoc */
    match(component: Draw2D): component is Draw2D {
        return component.draw2D as any;
    }

    /** @inheritDoc */
    add(component: Draw2D): void {
        if (this.indexer.has(component))
            return;

        const entry: DrawEntry = {
            component,
            sort: component.actor.require(Sort),
            order: this.size,
        };
        this.indexer.set(component, this.size);
        this.array.push(entry);
        this.size++;
    }

    /** @inheritDoc */
    remove(component: Draw2D): void {
        const index = this.indexer.get(component);
        if (typeof index === "undefined")
            return;

        this.indexer.delete(component);

        // avoid array internal memory resizing
        const last = this.array[--this.size];
        this.array[this.size] = null;

        // fill empty slot with last component
        if (index < this.size) {
            this.array[index] = last;
            this.indexer.set(last.component, index);
        }
    }

    /** @inheritDoc */
    tick(deltaTime: number): void {
        const ctx2D = this.context2D;

        // sort for proper draw order
        const items = this.array;
        items.sort(this.compare);

        // process each entry
        for (let i = 0, size = this.size; i < size; i++) {
            const entry = items[i];
            const component = entry.component;

            // update order if changed while sort
            if (entry.order !== i) {
                entry.order = i;
                this.indexer.set(component, i);
            }

            // draw if active
            if (component.actor.active)
                component.draw2D(ctx2D);
        }
    }

    /** Compare two components by sorting layer, order and z-index. */
    private compare(a: DrawEntry, b: DrawEntry): number {
        return a.sort.layer - b.sort.layer
            || ~b.component.order - ~a.component.order
            || a.order - b.order
            ;
    }
}

interface DrawEntry {
    sort: Sort;
    order: number;
    component: Draw2D;
}
