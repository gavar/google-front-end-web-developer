import {Argv} from "@cli";
import Yargs from "yargs/yargs";

export function lazy<T = void>(argv?: Argv<any>): Argv<T> {
    return argv || Yargs(process.argv.slice(2)) as any;
}
