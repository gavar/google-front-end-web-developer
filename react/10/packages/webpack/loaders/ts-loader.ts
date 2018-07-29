import TsImportTransformerFactory from "ts-import-plugin";
import {CompilerOptions, CustomTransformers} from "typescript";
import {RuleSetRule} from "~webpack";

export interface TsLoaderOptions {
    configFile?: string,
    compilerOptions?: CompilerOptions;
}

export function tsLoader(options?: TsLoaderOptions): RuleSetRule {
    // defaults
    options = options || {};
    return {
        test: /\.(jsx?|tsx?)$/,
        loader: "ts-loader",
        options: {
            logLevel: "INFO",
            transpileOnly: true,
            getCustomTransformers: transformers,
            ...options,
        },
        exclude: /node_modules/,
    };
}

function transformers(): CustomTransformers {
    return {
        before: [
            TsImportTransformerFactory({
                libraryName: "@material-ui/core",
                libraryDirectory: (name => {
                    if (hasExportProperty("@material-ui/core/styles", name))
                        return `es/styles/${name}`;
                    return `es/${name}`;
                }),
                camel2DashComponentName: false,
                camel2UnderlineComponentName: false,
                transformToDefaultImport: true,
            }),

            TsImportTransformerFactory({
                libraryName: "@material-ui/icons",
                libraryDirectory: "es",
                camel2DashComponentName: false,
                camel2UnderlineComponentName: false,
                transformToDefaultImport: true,
            }),
            TsImportTransformerFactory({
                libraryName: "core-decorators",
                libraryDirectory: "es",
                camel2DashComponentName: true,
                transformToDefaultImport: true,
            }),
            TsImportTransformerFactory({
                libraryName: "jss",
                libraryDirectory: "src",
                camel2DashComponentName: true,
                transformToDefaultImport: true,
            }),
        ],
    };
}

function hasExportProperty(path: string, propertyName: string): boolean {
    try {
        const exports = require(path);
        return exports && exports.hasOwnProperty(propertyName);
    }
    catch {
        return false;
    }
}
