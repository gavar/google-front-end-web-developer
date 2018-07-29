import HtmlWebpackPlugin from "html-webpack-plugin";
import {Tapable} from "tapable";
import {Configuration} from "~webpack";
import {Configurer} from "../";
import Plugin = Tapable.Plugin;

export interface HtmlConfigureOptions extends HtmlWebpackPlugin.Options {

}

export function configureHTML(config: Configuration, configurer: Configurer, options?: HtmlConfigureOptions): void {
    const {optimize} = configurer;

    // defaults
    options = {
        ...options,
        inject: true,
        minify: optimize && {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        },
    };

    // plugins
    const {plugins} = config;
    plugins.push(
        new HtmlWebpackPlugin(options) as Plugin,
    );
}
