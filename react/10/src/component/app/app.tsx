import React from "react";
import {Header} from "../header";
import {Main} from "../main";
import {Navbar} from "../navbar";
import "./app.css";

export class App extends React.Component {

    /** @inheritDoc */
    render() {
        return <div className="app">
            <Header/>
            <Navbar/>
            <Main/>
        </div>;
    }
}
