/**
 * Represents object that have to be constructed before access.
 */
export interface Constructable {

    /** Initialize an object. */
    construct();
}

/**
 * Annotation which run {@link Constructable#construct} on a given object before access.
 */
export function Construct(target: Constructable) {
    const construct = target.construct;
    delete target.construct;
    construct.apply(target);
}
