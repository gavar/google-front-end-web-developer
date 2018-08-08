export function hasOwnProperty(object: object, propertyName?: string): boolean {
    for (const key in object)
        if (object.hasOwnProperty(key))
            if (!propertyName || key === propertyName)
                return true;
}
