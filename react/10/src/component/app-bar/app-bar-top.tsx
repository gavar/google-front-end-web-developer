import React, {Component} from "react";
import {Menu} from "../../icon";
import {Button} from "../../view";
import "./app-bar-top.scss";

export interface AppBarProps {
    title?: string;
    onNavClick?();
}

export class AppBarTop extends Component<AppBarProps> {

    render() {
        const {title, onNavClick} = this.props;
        return <div className="app-bar-top">
            <Button color="clear"
                    className="nav-button"
                    onClick={onNavClick}>
                <Menu className="nav-icon"/>
            </Button>
            <h6>{title}</h6>
        </div>;
    }
}
