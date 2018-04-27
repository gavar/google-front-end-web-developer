import {Dictionary} from "@syntax";
import * as yargs from "yargs";
import {Arguments, Options} from "yargs";

export interface CommonArguments extends Arguments {
    watch: boolean;
    flags: string[];
}

const options: Dictionary<string, Options> = {
    watch: {alias: "w", type: "boolean"},
};

export function flags(): string[] {
    return process.argv.filter(x => x.startsWith("-"));
}

export function argv(): CommonArguments {
    const args: CommonArguments = {...yargs.options(options).argv} as any;
    args.flags = flags();
    return args;
}

export const args = argv();
