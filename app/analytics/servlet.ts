import express from "express";
import proxy from "express-http-proxy";
import {AddressInfo} from "net";

const PORT = process.env.PORT || 8000;
const app = express();

// https://medium.freecodecamp.org/save-your-analytics-from-content-blockers-7ee08c6ec7ee
// proxying requests from /ga to www.google-analytics.com
app.use("/ga/", proxy("https://www.google-analytics.com"));

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
