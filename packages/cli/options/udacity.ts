import {Argv, lazy} from "@cli";

export interface UdacityArguments {
    /** Whether running compilation compatibly with Udacity submission rules. */
    udacity: boolean;
}

export function udacity<T = void>(argv?: Argv<T>): Argv<T & UdacityArguments> {
    const yargs = lazy<T & UdacityArguments>(argv);
    yargs.option("udacity", {alias: "env.udacity", type: "boolean", default: false});
    return yargs;
}
