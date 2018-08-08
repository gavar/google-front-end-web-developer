import React, {Component} from "react";
import {ArrowLeft, ArrowRight} from "../../icon";
import {Button, Drawer} from "../../view";
import "./nav-drawer.scss";

export interface NavDrawerProps {
    open?: boolean;
    onToggle?();
}

export class NavDrawer extends Component<NavDrawerProps> {
    render() {
        const {open, children} = this.props;
        return <Drawer open={open}
                       className="nav-drawer"
                       variant="persistent">
            {NavDrawerToggle(this.props)}
            {children}
        </Drawer>;
    }
}

function NavDrawerToggle(props: NavDrawerProps) {
    const {open, onToggle} = props;
    const Arrow = open ? ArrowLeft : ArrowRight;
    return <Button color="clear"
                   onClick={onToggle}
                   className="nav-drawer-toggle">
        <Arrow/>
    </Button>;
}