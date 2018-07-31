const buffer: Map<any, any> = new Map();

/**
 * Produce duplicate free array of items.
 * @param items - items to compare for uniqueness.
 * @param selector - function which select unique key being compared.
 * @returns array of unique elements.
 */
export function uniq<T, K>(items: T[], selector: (value: T) => K): T[] {
    try {
        for (const value of items) {
            const key = selector(value);
            buffer.set(key, value);
        }
        return Array.from(buffer.values());
    }
    finally {
        buffer.clear();
    }
}
