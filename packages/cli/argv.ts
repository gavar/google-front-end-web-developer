import * as yargs from "yargs";
import {Arguments, Options, ParseCallback} from "yargs";

export interface Argv<T={}> {
    (): T;
    (args: string[], cwd?: string): T;

    /** @inheritDoc */
    parse(): T ;

    /** @inheritDoc */
    parse(args: string | string[], context?: object, callback?: ParseCallback): T;

    /** @inheritDoc */
    option(key: keyof T, options: Options): this;

    /** @inheritDoc */
    option(options: {[P in keyof T]: Options}): this;
}

export interface CommonArguments extends Arguments {
    watch: boolean;
    flags: string[];
}

const options = yargs.options({
    watch: {alias: "w", type: "boolean"},
});

const extras: string[] = [];

export function extra(...argv: string[]) {
    extras.push(...argv);
}

export function flags(argv: string[]): string[] {
    argv = argv.filter((value, index, array) => value.startsWith("-"));
    argv = argv.filter((value, index, array) => array.indexOf(value) === index);
    return argv;
}

export function argv(): CommonArguments {
    const argv = [
        ...extras,
        ...process.argv,
    ];
    const args = options.parse(argv) as CommonArguments;
    args.flags = flags(argv);
    return args;
}

export const args = argv();
