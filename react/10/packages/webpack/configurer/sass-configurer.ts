import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {Tapable} from "tapable";
import {Configuration} from "~webpack";
import {Configurer} from "../";
import {sassLoader, SassLoaderOptions} from "../loaders";
import Plugin = Tapable.Plugin;

export interface SassConfigureOptions {
    output?: {
        filename?: string;
        chunkFilename?: string;
    },
    loader?: SassLoaderOptions,
}

export function configureSASS(config: Configuration, configurer: Configurer, options?: SassConfigureOptions): void {
    // defaults
    options = options || {};
    let {loader, output} = options;
    loader = loader || {};

    // rules
    const {module} = config;
    module.rules.push(sassLoader(configurer, loader));

    // plugins
    const {plugins} = config;
    plugins.push(
        new MiniCssExtractPlugin(output) as Plugin,
    );
}
