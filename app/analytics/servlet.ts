import express from "express";
import proxy from "express-http-proxy";
import {AddressInfo} from "net";

const PORT = process.env.PORT || 8000;
const app = express();

// https://medium.freecodecamp.org/save-your-analytics-from-content-blockers-7ee08c6ec7ee
// proxying requests from /ga to www.google-analytics.com
app.use("/ga/", proxy("https://www.google-analytics.com", {
    proxyReqPathResolver: function (req) {
        let url = req.url;
        const ip = IPv4(req);
        if (ip) {
            const s = url.indexOf("?") >= 0 ? "&" : "?";
            url = `${url}${s}uip=${ip}`;
        }
        return url;
    },
}));

function IPv4(req) { // get the client's IP address
    const v6: string = req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.connection.socket && req.connection.socket.remoteAddress;

    let v4 = v6.match(/::ffff:(.*)$/);
    if (v4 && v4.length > 1) return v4[1];

    v4 = v6.match(/::(\d+)$/);
    if (v4 && v4.length > 1) return "127.0.0." + v4[1];

    return v6;
}

const server = app.listen(PORT);
server.on("error", error);
server.on("listening", listening);

function listening() {
    const {address, port} = server.address() as AddressInfo;
    const host = address == "::" ? "localhost" : address;
    console.log(`Web application ready on http://${host}:${port}`);
}

function error(e: any & Error) {
    switch (e.code) {
        case "EADDRINUSE":
            const {address, port} = e;
            console.error(`address is already in use: ${address}:${port}`);
            break;
        default:
            console.error(e);
            break;
    }
}
