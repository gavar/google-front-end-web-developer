require("tsconfig-paths/register");

import {WebpackArgv, WebpackEnv} from "@webpack";
import {Configuration} from "webpack";
import sass from "./webpack/webpack-sass.config";
import ts from "./webpack/webpack-ts.config";

export = async function (env: WebpackEnv, argv: WebpackArgv): Promise<Configuration[]> {
    return [
        ts(env, argv),
        sass(env, argv),
    ];
}
