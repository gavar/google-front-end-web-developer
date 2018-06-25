import {Argv, lazy} from "@cli";
import {ProxyYargs} from "@cli/proxy-yargs";
import {Dictionary} from "@syntax";
import {isArray, isString} from "@util";
import {WebpackArgv} from "@webpack/webpack-argv";
import webpackYargs from "webpack-cli/bin/config-yargs";
import {Options} from "yargs";

export function webpack<T = void>(argv?: Argv<T>): Argv<T & WebpackArgv> {
    const yargs = lazy<T & WebpackArgv>(argv);
    webpackYargs(yargs);
    return yargs;
}

export namespace webpack {

    /** Spy which intercepts webpack CLI configuration.*/
    const proxy = spy();

    /** Flatten option of webpack CLI. */
    const webpackOptions = spyOptions(true);

    /**
     * Extract webpack related fags from given argument list.
     */
    export function argv(argv: string[] = process.argv): string[] {
        const array: string[] = [];

        for (let i = 0; i < argv.length; i++) {
            const pair = explode(argv[i]);
            const [flag, key] = pair;

            // starts with '--' or '-'?
            if (!flag) continue;

            // is known flag?
            const option = webpackOptions[key];
            if (!option) continue;

            if (option.requiresArg) {
                if (key.includes("=")) {
                    array.push(argv[i]);
                }
                else if (i + 1 < argv.length) {
                    array.push(argv[i]);
                    array.push(argv[++i]);
                }
            }
            else {
                array.push(argv[i]);
            }
        }

        return array;
    }

    function explode(value: string): string[] {
        if (value.startsWith("--")) return ["--", value.slice(2)];
        if (value.startsWith("-")) return ["-", value.slice(1)];
        return [, value];
    }

    function spy(): ProxyYargs {
        const proxy = ProxyYargs();
        webpackYargs(proxy);
        return proxy;
    }

    function spyOptions(flatten: boolean = true): Dictionary<string, Options> {
        const options = {...proxy._options};
        if (flatten) {
            for (const key in options) {
                const option = options[key];
                if (isString(option.alias))
                    options[option.alias] = option;
                else if (isArray(option.alias)) {
                    for (const key of option.alias)
                        options[key] = option;
                }
            }
        }
        return options;
    }
}
