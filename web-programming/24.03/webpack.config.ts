import {CheckerPlugin} from "awesome-typescript-loader";
import * as path from "path";
import {Configuration} from "webpack";

const config: Configuration = {
    mode: "development",
    entry: "./src/js/app",
    devtool: "source-map",
    output: {
        filename: "app.js",
        path: path.resolve("./dist/js"),
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
