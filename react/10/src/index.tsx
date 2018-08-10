import React from "react";
import ReactDOM from "react-dom";
import sw from "serviceworker-webpack-plugin/lib/runtime";
import {App} from "./component";
import "./index.scss";

if ("serviceWorker" in navigator)
    sw.register();

ReactDOM.render(
    <App/>,
    document.getElementById("root") as HTMLElement,
);
