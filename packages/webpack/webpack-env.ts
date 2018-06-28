import {DeepPartial} from "@syntax";

/**
 * Explicitly defined environment options.
 * Options are provided by <code>webpack --env</code>.
 * @see https://webpack.js.org/api/cli/#environment-options
 */
export interface WebpackEnv {
    "url-loader": WebpackUrlLoaderEnv
}

/**
 * Options of url-loader.
 */
export interface WebpackUrlLoaderEnv {
    limit?: number;
    emitFile?: boolean;
    name?: string;
}

export function safeWebpackEnv(env?: DeepPartial<WebpackEnv>): WebpackEnv {
    env = {...env};
    setDefault(env, "url-loader", {});
    return env as WebpackEnv;
}

export function setDefault<T, K extends keyof T>(source: T, key: K, value: T[K]) {
    switch (typeof source[key]) {
        case "undefined":
            source[key] = value;
            break;
    }
}
