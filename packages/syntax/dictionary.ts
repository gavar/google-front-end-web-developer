export interface StringDictionary<T = any> {
    [key: string]: T;
}

export interface NumberDictionary<T = any> {
    [key: number]: T;
}

export type Dictionary<K = string | number, T = any> =
    K extends string ? StringDictionary<T> :
        K extends number ? NumberDictionary<T> :
            StringDictionary<T> & NumberDictionary<T>;

export type ObjectLiteral<T = any> = Dictionary<string | number, T>;
