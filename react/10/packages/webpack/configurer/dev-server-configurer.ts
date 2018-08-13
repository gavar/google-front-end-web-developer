import {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {Configuration, Stats} from "~webpack";
import ToStringOptionsObject = Stats.ToStringOptionsObject;

export function configureDevServer(config: Configuration): void {
    const stats: ToStringOptionsObject = {
        colors: true,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false,
        hash: false,
        modules: false,
        version: false,
    };

    config.devServer = {
        stats,
        hot: true,
        inline: true,
        contentBase: config.output.path,
    } as DevServerConfiguration;
}
