import {identity} from "./identity";

/**
 * Create class name string from providing names including only non empty strings.
 * @param {string} names - list of class names to include.
 */
export function classNames(...names: string[]) {
    names = names.filter(identity);
    return names.join(" ");
}


