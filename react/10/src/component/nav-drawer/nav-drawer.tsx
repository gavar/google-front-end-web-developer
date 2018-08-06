import React, {Component} from "react";
import {Drawer} from "../../view";
import "./nav-drawer.scss";

export interface NavDrawerProps {
    open?: boolean;
}

export class NavDrawer extends Component<NavDrawerProps> {
    render() {
        const {open, children} = this.props;
        return <Drawer open={open}
                       className="nav-drawer"
                       variant="persistent">
            {children}
        </Drawer>;
    }
}
