/**
 * Represents type that has property with the given name.
 * @template K - name of the property.
 * @template T - type of the property.
 */
export type With<K extends string, T> = { [P in K]: T };
