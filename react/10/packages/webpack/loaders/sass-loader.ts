import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import {RuleSetRule} from "~webpack";
import {Configurer} from "../";

export interface SassLoaderOptions {
    includePaths?: string[];
}

export function sassLoader(configurer: Configurer, options?: SassLoaderOptions): RuleSetRule {
    const {optimize, context, hmr} = configurer;

    const postcssLoader = {
        loader: "postcss-loader",
        ident: "postcss",
        options: {
            plugins: (loader) => [
                require("postcss-import")({addDependencyTo: loader}),
                require("postcss-cssnext")(),
                // disable autoprefixer, because it's already included in cssnext
                optimize && require("cssnano")({autoprefixer: false}),
                require("postcss-reporter")({clearReportedMessages: true}),
            ].filter(identity),
        },
    };

    const sassLoader = {
        loader: "sass-loader",
        options: {
            includePaths: options.includePaths || [
                path.join(context, "src"),
            ],
        },
    };

    const cssLoader = {
        loader: "css-loader",
        options: {
            url: false, // by postcss-url
            import: false, // by postcss-import
            importLoaders: 3,
        },
    };

    return {
        test: /\.(sa|sc|c)ss$/,
        use: [
            hmr && "css-hot-loader",
            hmr ? "style-loader" : MiniCssExtractPlugin.loader,
            cssLoader,
            postcssLoader,
            sassLoader,
        ].filter(identity),
    };
}

function identity(x) {
    return x;
}
