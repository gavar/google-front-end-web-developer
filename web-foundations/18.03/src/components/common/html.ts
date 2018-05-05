export function querySelectorWithParents<E extends Element = Element>(element: Element, selector: string): E | null {
    return element && element.querySelector<E>(selector) ||
        querySelectorInParents<E>(element, selector);
}

export function querySelectorInParents<E extends Element = Element>(element: Element, selector: string): E | null {
    // while has parent
    for (; element; element = element.parentElement) {
        const query = element.querySelector<E>(selector);
        if (query) return query;
    }
}

export default {
    querySelectorWithParents,
    querySelectorInParents,
};
