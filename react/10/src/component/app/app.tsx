import React from "react";

import logo from "../../logo.svg";
import "./app.css";

export class App extends React.Component {
    public render() {
        return (
            <div className="app">
                <header className="app-header">
                    <img src={logo} className="app-logo" alt="logo"/>
                    <h1 className="app-title">Welcome to React</h1>
                </header>
                <p className="app-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
            </div>
        );
    }
}
