import {Argv} from "@cli";
import yargs from "yargs";

export function lazy<T>(argv?: Argv<any>): Argv<T> {
    return argv || yargs(process.argv, process.cwd()) as any;
}
