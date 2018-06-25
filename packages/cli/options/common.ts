import {Argv, lazy} from "@cli";

export interface CommonArguments {
    watch: boolean;
    production: boolean;
}

export function common<T = void>(argv?: Argv<T>): Argv<T & CommonArguments> {
    const yargs = lazy<T & CommonArguments>(argv);
    yargs.option("watch", {alias: "w", type: "boolean"});
    yargs.option("production", {alias: "p", type: "boolean"});
    return yargs;
}
