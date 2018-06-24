import cookieParser from "cookie-parser";
import express, {Request, Response} from "express";
import useragent from "express-useragent";
import {AddressInfo} from "net";
import request, {CoreOptions} from "request";
import uuid from "uuid/v4";

const PORT = process.env.PORT || 8000;
const app = express();
app.use(useragent.express());
app.use(cookieParser());
app.get("/", function (req: Request, res: Response) {
    try {
        track(req, res);
    }
    catch (e) {
        console.log("error", e);
    }
    finally {
        res.sendStatus(204);
    }
});

function track(req: Request, res: Response) {
    const {query, cookies} = req;

    let cid = cookies["cid"];
    if (!cid) {
        cid = uuid();
        res.cookie("cid", cid, {httpOnly: true});
    }

    // required params
    const params = [
        "v", "1",
        "tid", query["tid"],
        "t", query["t"],
        "cid", cid,
    ];
    delete query["t"];
    delete query["tid"];

    // extra parameters
    for (const key in query)
        if (query.hasOwnProperty(key))
            params.push(key, query[key]);

    // info
    params.push("ua", req.useragent.source);

    // escape values
    for (let i = 0; i < params.length; i++)
        params[i] = escape(params[i]);

    // tokenize
    const tokens = [];
    for (let i = 0; i < params.length; i = i + 2)
        tokens.push(params[i] + "=" + params[i + 1]);

    const options: CoreOptions = {
        body: tokens.join("&"),
    };

    console.log(options.body);
    request.post("https://www.google-analytics.com/collect", options, (err, res) => {
        if (err) console.error(err);
        else console.log(res.toJSON());
    });
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
