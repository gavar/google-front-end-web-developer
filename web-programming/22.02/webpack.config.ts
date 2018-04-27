import * as path from "path";
import {Configuration} from "webpack";
import {CheckerPlugin} from "awesome-typescript-loader";

const config: Configuration = {
    mode: "development",
    entry: "./src/index",
    devtool: "source-map",
    output: {
        filename: "index.js",
        path: path.resolve("./dist"),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                use: ["awesome-typescript-loader"],
            },
        ],

    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
    },
    plugins: [
        new CheckerPlugin(),
    ],
};

export = config;
