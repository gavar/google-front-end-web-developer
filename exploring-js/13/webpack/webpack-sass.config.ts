import {safeWebpackEnv, WebpackArgv, WebpackEnv} from "@webpack";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import path from "path";
import {Configuration} from "webpack";

export default function (env: WebpackEnv, argv: WebpackArgv): Configuration {
    env = safeWebpackEnv(env);
    const urlLoader = env["url-loader"];
    return {
        entry: {
            "css/style.css": "./src/css/style.css",
        },
        mode: argv.mode || "development",
        devtool: argv.devtool || argv.mode !== "production" ? "source-map" : false,
        devServer: {
            contentBase: "dist",
            hot: true,
        },
        output: {
            filename: "[name]",
            path: path.resolve("./dist"),
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    loader: "url-loader",
                    options: {
                        limit: urlLoader.limit || undefined,
                        name: "../img/[name].[ext]",
                    },
                },
                {
                    test: /\.css$/,
                    use: ["css-hot-loader"].concat(ExtractTextPlugin.extract({
                        use: ["css-loader", "postcss-loader"],
                    })),
                },
            ],
        },
        resolve: {
            extensions: [
                ".css",
            ],
        },
        plugins: [
            new ExtractTextPlugin("[name]"),
        ],
    };
};
