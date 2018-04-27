import * as browserSyncConsole from "@browser-sync-console";
import * as browserSync from "browser-sync";
import {BrowserSyncInstance, Options} from "browser-sync";

const defaults: Options = {
    open: false,
    server: true,
    watch: true,
    plugins: [
        browserSyncConsole,
    ],
};

export function serve(options?: Options): BrowserSyncInstance {
    options = Object.assign({}, defaults, options);
    console.log("options:", options);
    const bs = browserSync.create();
    return bs.init(options);
}
