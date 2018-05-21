import {Argv, lazy} from "@cli";
import webpack from "webpack-cli/bin/config-yargs";

export interface WebpackArguments {
    config: string;
    production: boolean;
}

export function webpack<T = void>(argv?: Argv<T>): Argv<T & WebpackArguments> {
    const yargs = lazy<T & WebpackArguments>(argv);
    webpack(yargs);
    return yargs;
}
