import {Compare} from "@syntax";

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

        this.indexer.delete(item);

        // fill empty slot with last component
        const last = this.array.pop();
        if (last !== item) {
            this.array[index] = last;
            this.indexer.set(last, index);
        }

        return true;
    }

    /** Remove all items from a collection. */
    clear() {
        this.array.length = 0;
        this.indexer.clear();
    }
}
