import CleanWebpackPlugin from "clean-webpack-plugin";
import {Tapable} from "tapable";
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
import ManifestPlugin from "webpack-manifest-plugin";
import {Configuration, EnvironmentPlugin, Stats} from "~/webpack";
import {
    configureDevServer,
    configureHTML,
    configureSASS,
    configureServiceWorker,
    configureSVG,
    configureTS,
    HtmlConfigureOptions,
    SassConfigureOptions,
    ServiceWorkerConfigureOptions,
    TsConfigureOptions,
} from "./configurer";
import {WebpackArgv} from "./webpack-argv";
import {WebpackEnv} from "./webpack-env";
import ToStringOptionsObject = Stats.ToStringOptionsObject;
import Plugin = Tapable.Plugin;

export interface Configurer extends Configuration {
    optimize: boolean;
    hmr: boolean;
}

export interface ConfigurerOptions extends Partial<Configurer> {
    ts?: TsConfigureOptions,
    sass?: SassConfigureOptions,
    html?: HtmlConfigureOptions,
    serviceWorker?: ServiceWorkerConfigureOptions,
}

export interface ConfigurerProvider {
    (env: WebpackEnv, argv: WebpackArgv): ConfigurerOptions;
}

export function configurer(provider: ConfigurerProvider) {
    return async function configure(env: WebpackEnv, argv: WebpackArgv): Promise<Configuration> {
        // acquire options
        let options = provider(env, argv)as ConfigurerOptions & Configurer;

        // default options
        const root = options.context || process.cwd();
        const production = argv.mode === "production";
        const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"));
        options = {
            context: root,
            optimize: production,
            hmr: isDevServer,
            output: {path: "dist"},
            ...options,
        };

        // prepare config
        const config: Configuration = {
            mode: argv.mode || "development",
            entry: [],
            devtool: production ? false : "source-map",
            output: {...options.output},
            stats: {
                colors: true,
                children: false,
            } as ToStringOptionsObject,
            resolve: {
                extensions: [],
                plugins: [],
            },
            module: {
                rules: [],
            },
            plugins: [],
        };

        // apply configurers
        configureTS(config, options.ts);
        configureSVG(config, options);
        configureSASS(config, options, options.sass);
        configureHTML(config, options, options.html);
        configureDevServer(config);

        if (options.serviceWorker)
            configureServiceWorker(config, options, options.serviceWorker);

        // plugins
        config.plugins.push(
            new CleanWebpackPlugin(config.output.path, {
                root,
                verbose: true,
            }) as Plugin,
            new EnvironmentPlugin({
                "PUBLIC_URL": "/",
                ...process.env,
            }),
            new ManifestPlugin(),
        );

        // configure profile mode
        if (argv.profile) {
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    openAnalyzer: false,
                    analyzerMode: "static",
                }) as Plugin,
            );
        }

        return config;
    };
}
