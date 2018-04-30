import {WebpackArgv, WebpackEnv} from "@webpack";
import {CheckerPlugin} from "awesome-typescript-loader";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import {Configuration} from "webpack";

export = async function (env: WebpackEnv, argv: WebpackArgv): Promise<Configuration> {
    const production = argv.mode === "production";
    const develop = !production;
    return {
        mode: "development",
        entry: {
            "js/app.js": "./src/js/app",
            "css/app.css": "./src/css/app",
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
                        limit: develop ? 1 : undefined, // do not inline for dev mode
                        name: "img/[name].[ext]",
                    },
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        use: ["css-loader", "postcss-loader"],
                    }),
                },
                {
                    test: /\.tsx?$/,
                    use: ["awesome-typescript-loader"],
                },
            ],
        },
        resolve: {
            extensions: [
                ".ts",
                ".js",
                ".css",
                ".json",
            ],
        },
        plugins: [
            new CheckerPlugin(),
            new ExtractTextPlugin("[name]"),
        ],
    };
};
