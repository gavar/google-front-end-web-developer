require("tsconfig-paths/register");

import {configurer, ConfigurerOptions} from "$webpack";
import {join, resolve} from "path";

export = configurer((env, argv) => {
    const root = process.cwd();
    const dev = argv.mode !== "production";
    const publicPath = resolve(root, "public");
    return {
        context: root,
        output: {
            path: resolve(root, "dist"),
        },
        ts: {
            entry: "src/index.tsx",
            output: {
                filename: `static/js/${dev ? "[name].js" : "[name].[contenthash:8].js"}`,
            },
            loader: {
                configFile: resolve(root, "tsconfig.webpack.json"),
            },
        },
        html: {
            template: join(publicPath, "index.html"),
            favicon: join(publicPath, "favicon.ico"),
        },
    } as ConfigurerOptions;
})
