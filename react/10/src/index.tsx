import React from "react";
import ReactDOM from "react-dom";
import {App} from "./component";
import "./index.css";
import {register} from "./registerServiceWorker";

ReactDOM.render(
    <App/>,
    document.getElementById("root") as HTMLElement,
);
register();
