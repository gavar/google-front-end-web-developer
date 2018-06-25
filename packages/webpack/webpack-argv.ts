import {Options} from "webpack";

/**
 * Webpack options which describes the options passed to webpack.
 * @see https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 */
export interface WebpackArgv {
    mode: "development" | "production" | "none";
    watch: boolean;
    debug: boolean;
    config: string;
    devtool: Options.Devtool;

    /** Shortcut for --optimize-minimize --define process.env.NODE_ENV="production". */
    p: boolean;

    /** Shortcut for --debug --devtool cheap-module-eval-source-map --output-pathinfo */
    d: boolean;
}
