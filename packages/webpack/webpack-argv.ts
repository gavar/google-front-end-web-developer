/**
 * Webpack options which describes the options passed to webpack.
 * @see https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 */
export interface WebpackArgv {
    mode: "development" | "production" | "none";
    w: boolean;
    watch: boolean;
    debug: boolean;
}
