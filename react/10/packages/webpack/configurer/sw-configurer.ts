import ServiceWorkerPlugin from "serviceworker-webpack-plugin";
import {Configuration} from "~webpack";
import {Configurer} from "../";

export interface ServiceWorkerConfigureOptions {
    /** Path to the actual service worker implementation. */
    entry: string;

    /**
     * Specifies the public URL address of the output files when referenced in a browser.
     * We use this value to load the service worker over the network.
     * @default process.env.PUBLIC_PATH || "/"
     */
    publicPath?: string;

    /**
     * Whether to minimize output.
     * @default process.env.NODE_ENV === 'production'
     */
    minimize?: boolean;

    /**
     * Receives a raw serviceWorkerOption argument.
     * The jsonStats key contains all the webpack build information.
     */
    transformOptions?(options: ServiceWorkerOptions): any
}

export interface ServiceWorkerOptions {
    hash?: string
    assets: string[];
    jsonStats: any
}

export function configureServiceWorker(config: Configuration, configurer: Configurer, options: ServiceWorkerConfigureOptions): void {
    // defaults
    options = {
        publicPath: process.env.PUBLIC_PATH || "/",
        transformOptions: function (serviceWorkerOption) {
            const {assets, jsonStats, ...other} = serviceWorkerOption;
            const hash = jsonStats.hash || other.hash || String(Date.now());
            return {assets, hash};
        },
        ...options,
    };

    // plugins
    const {plugins} = config;
    plugins.push(
        new ServiceWorkerPlugin(options),
    );
}
