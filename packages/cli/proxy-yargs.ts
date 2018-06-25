import {Dictionary} from "@syntax";
import {Argv, Options} from "yargs";
import Yargs from "yargs/yargs";

export interface ProxyYargs extends Argv {
    _options: Dictionary<string, Options>;
}

export function ProxyYargs(argv?: string[], cwd?: string, require?: Function): ProxyYargs {
    const yargs: ProxyYargs = Yargs(argv, cwd, require);
    yargs._options = {};
    intercept("option", yargs, options);
    intercept("options", yargs, options);
    return yargs;
}

function options(this: ProxyYargs) {
    switch (arguments.length) {
        case 1:
            Object.assign(this._options, arguments[0]);
            break;
        case 2:
            this._options[arguments[0]] = arguments[1];
            break;
    }
}

function intercept<K extends string>(key: K, target: Record<K, Function>, hook: Function) {
    const func = target[key];
    target[key] = function () {
        hook.apply(this, arguments);
        return func.apply(this, arguments);
    };
}
