import cookieParser from "cookie-parser";
import express, {NextFunction, Request, Response} from "express";
import useragent from "express-useragent";
import {AddressInfo} from "net";
import got from "got";
import uuid from "uuid/v4";

const PORT = process.env.PORT || 8000;
const app = express();
app.enable("trust proxy");
app.use(useragent.express());
app.use(cookieParser());
app.get("/", function (req: Request, res: Response, next: NextFunction) {
    track(req, res)
        .then(x => {
            res.status(204).send();
            console.log(x);
        })
        .catch(next);
});

function track(req: Request, res: Response) {
    const {query, cookies} = req;

    let cid = cookies["cid"];
    if (!cid) {
        cid = uuid();
        res.cookie("cid", cid, {httpOnly: true});
    }

    // analytics params
    const data = {
        v: 1,
        cid,
        ...query,
        ua: req.useragent.source,
    };

    return got.post("http://www.google-analytics.com/collect", {
        form: data,
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
