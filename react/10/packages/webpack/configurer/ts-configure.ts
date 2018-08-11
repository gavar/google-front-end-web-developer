import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import {Configuration} from "~webpack";
import {tsLoader, TsLoaderOptions} from "../loaders";

export interface TsConfigureOptions {
    entry: string;
    output?: {
        filename?: string;
        chunkFilename?: string;
    }
    loader?: TsLoaderOptions,
}

export function configureTS(config: Configuration, options: TsConfigureOptions): void {
    // defaults
    let {loader} = options;
    loader = loader || {};

    // entry
    const entry = config.entry as string[];
    entry.push(options.entry);

    // output
    const {output} = options;
    if (output) Object.assign(config.output, output);

    // rules
    const {module} = config;
    module.rules.push(tsLoader(loader));

    // resolve extensions
    const {resolve} = config;
    resolve.extensions.push(
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
    );

    // resolve plugins
    resolve.plugins.push(
        new TsConfigPathsPlugin({
            logLevel: "INFO",
            configFile: loader.configFile,
        }),
    );
}
