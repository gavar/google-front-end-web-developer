import {CheckerPlugin} from "awesome-typescript-loader";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import {Configuration} from "webpack";

const config: Configuration = {
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

export = config;
