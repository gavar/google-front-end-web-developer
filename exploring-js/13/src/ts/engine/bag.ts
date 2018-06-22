import {Compare} from "@syntax";

export namespace Bag {

    /**
     * Remove item from a bag-like array.
     * When last item removed, returns false.
     * Otherwise, places a last item to a given index and returns true.
     *
     * @param items - bag-like array.
     * @param index - zero-based index of the item to remove.
     */
    export function removeAt<T>(items: T[], index: number): boolean {
        const last = items.pop();
        if (index >= items.length)
            return false;

        items[index] = last;
        return true;
    }
}

/**
 * Unordered list of unique items using O(1) for read / write operations.
 */
export class BagSet<T = any> {

    private readonly array: T[];
    private readonly indexer: Map<T, number>;

    constructor() {
        this.array = [];
        this.indexer = new Map<T, number>();
    }

    /** Unordered list of all items in a collection. */
    get items(): ReadonlyArray<T> {
        return this.array;
    }

    /** Number of items in a collection. */
    get size() {
        return this.array.length;
    }

    /**
     * Add item to collection.
     * @param item - item to add.
     * @return true if item successfully added; false if item already exists.
     */
    add(item: T): boolean {
        if (this.indexer.has(item))
            return false;

        this.indexer.set(item, this.array.length);
        this.array.push(item);
        return true;
    }

    /**
     * Whether given item exists in the bag.
     * @param item - item to check.
     */
    has(item: T): boolean {
        return this.indexer.has(item);
    }

    /**
     * Sort items in collection.
     * @param compare - function to use for comparing items.
     */
    sort(compare: Compare<T>) {
        this.indexer.clear();
        this.array.sort(compare);
        for (let i = 0; i < this.array.length; i++)
            this.indexer.set(this.array[i], i);
    }

    /**
     * Remove item from collection.
     * @param item - item to remove.
     * @return true if item successfully removed; false if item was not found.
     */
    remove(item: T): boolean {
        const index = this.indexer.get(item);
        if (typeof index === "undefined")
            return false;

        // remove from indexer
        this.indexer.delete(item);

        // fill empty slot with last component
        if (Bag.removeAt(this.array, index))
            this.indexer.set(this.array[index], index);

        return true;
    }

    /** Remove all items from a collection. */
    clear() {
        this.array.length = 0;
        this.indexer.clear();
    }
}
