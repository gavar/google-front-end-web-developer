import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import {RuleSetRule} from "~webpack";
import {Configurer} from "../";

export interface SassLoaderOptions {
    includePaths?: string[];
    resources?: string[];
}

export function sassLoader(configurer: Configurer, options?: SassLoaderOptions): RuleSetRule {
    const {optimize, context, hmr} = configurer;
    const {includePaths, resources} = options || {} as SassLoaderOptions;

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
            includePaths: includePaths || [
                path.join(context, "src"),
            ],
        },
    };

    const sassResourceLoader = {
        loader: "sass-resources-loader",
        options: {
            resources: resources || [
                path.join(context, "src", "main.scss"),
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
            sassResourceLoader,
        ].filter(identity),
    };
}

function identity(x) {
    return x;
}
