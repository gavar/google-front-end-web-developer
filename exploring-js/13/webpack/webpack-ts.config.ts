import {WebpackArgv, WebpackEnv} from "@webpack";
import {CheckerPlugin} from "awesome-typescript-loader";
import * as path from "path";
import {Configuration} from "webpack";

export default function (env: WebpackEnv, argv: WebpackArgv): Configuration {
    const production = argv.mode === "production";
    return {
        mode: argv.mode || "development",
        devtool: production ? false : "source-map",
        entry: {
            "js/resources.js": "./src/js/resources",
        },
        output: {
            filename: "[name]",
            path: path.resolve("./dist"),
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "awesome-typescript-loader",
                    options: {
                        configFileName: "webpack/tsconfig.json",
                        useBabel: false,
                        babelOptions: {
                            babelrc: false, /* Important line */
                            presets: [
                                ["env", {targets: "last 2 versions, ie 11", modules: false}],
                            ],
                        },
                    },
                },
            ],
        },
        resolve: {
            extensions: [
                ".ts",
                ".js",
                ".json",
            ],
        },
        plugins: [
            new CheckerPlugin(),
        ],
    };
};
