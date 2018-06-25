import {TaskFunction} from "gulp";

export function displayName(name: string, target?: TaskFunction): ClassDecorator {
    if (target) {
        target.displayName = name;
        return;
    }

    return function (target: Function) {
        (target as TaskFunction).name = name;
    };
}
