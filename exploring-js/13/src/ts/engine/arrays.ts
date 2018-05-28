import {Action1, With} from "@syntax";

type Compact<T> = void | T | ReadonlyArray<T>;

/** Utility class to work with arrays. */
export class Arrays {

    /** Array buffer for internal use. */
    private static readonly buffer: any[] = [];

    /**
     * Invoke method by given key on each of the item.
     * @param items - one or many items to invoke method on.
     * @param key - name of the instance method to invoke.
     * @param argument - argument to pass to the method.
     * @return number of times method has been invoked.
     */
    public static invoke<K extends string, P>(items: Compact<With<K, Action1<P>>>, key: K, argument: P): number {
        // array of items
        if (Array.isArray(items)) {
            for (const item of items)
                item[key](argument);

            return items.length;
        }

        // single item
        if (items) {
            (items as With<K, Function>)[key](argument);
            return 1;
        }

        return 0;
    }

    /**
     * Filter items by calling predicate in each of the instances.
     * @param items - list of items to filter.
     * @param key - name of the predicate to invoke on instance.
     * @param argument - argument to pass to the predicate.
     * @return none if not match found; one item if single match; array of items if multiple match found.
     */
    public static filter<T extends With<K, Action1<P>>, K extends string, P>(
        items: ReadonlyArray<T>, key: K, argument: P): T | T[] {

        const buffer = Arrays.buffer;
        try {
            for (const item of items)
                if (item[key](argument))
                    buffer.push(item);

            if (buffer.length > 1)
                return [...buffer];

            if (buffer.length > 0)
                return buffer[0];
        }
        finally {
            buffer.length = 0;
        }
    }
}
