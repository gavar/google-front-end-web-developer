import React from "react";
import logo from "../../logo.svg";
import "./header.css";

export function Header() {
    return <header>
        <img src={logo} className="header-logo" alt="logo"/>
        <h1 className="header-title">Welcome to React</h1>
    </header>;
}
