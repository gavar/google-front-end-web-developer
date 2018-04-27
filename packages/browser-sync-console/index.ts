import {BrowserSyncInstance} from "browser-sync";
import {EventEmitter} from "events";
import * as fs from "fs";
import * as path from "path";

export const plugin = function (options: any, browserSync: BrowserSyncInstance) {
    const server: EventEmitter = (browserSync as any).io; // SocketIO.Server
    server.on("connect", function (socket) {
        socket.on("message", function (type: string, ...args) {
            switch (type) {
                case "console:log":
                    console.log.apply(console, args);
                    break;
                case "console:warn":
                    console.warn.apply(console, args);
                    break;
                case "console:error":
                    console.error.apply(console, args);
                    break;
            }
        });
    });
};

const jsPath = path.join(__dirname, "browser.js");
export const hooks = {
    "client:js": fs.readFileSync(jsPath).toString(),
};
