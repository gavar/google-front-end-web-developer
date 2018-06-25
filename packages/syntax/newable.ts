/**
 * Defines object that has constructor with no arguments.
 */
export interface Newable<Type> {
    new(): Type;
}

/**
 * Defines object that has constructor with single argument.
 */
export interface Newable1<Type, T> {
    new(arg: T): Type;
}

/**
 * Defines object that has constructor with two arguments.
 */
export interface Newable2<Type, T1, T2> {
    new(arg1: T1, arg2: T2): Type;
}

/**
 * Defines object that has constructor with three arguments.
 */
export interface Newable3<Type, T1, T2, T3> {
    new(arg1: T1, arg2: T2, arg3: T3): Type;
}
