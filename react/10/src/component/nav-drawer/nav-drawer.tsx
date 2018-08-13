import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import {ArrowLeft, ArrowRight} from "../../icon";
import {Button, Drawer} from "../../view";
import "./nav-drawer.scss";

export interface NavDrawerProps {
    defaultOpen?: boolean;
    onToggle?();
}

interface NawDrawerState {
    open?: boolean;
}

export class NavDrawer extends PureComponent<NavDrawerProps, NawDrawerState> {

    constructor(props: NavDrawerProps, context) {
        super(props, context);
        const {defaultOpen} = props;
        this.state = {open: defaultOpen};
    }

    render() {
        const {open} = this.state;
        const {children} = this.props;
        return <Drawer open={open}
                       className="nav-drawer"
                       variant="persistent">
            {NavDrawerToggle(this)}
            {children}
        </Drawer>;
    }

    @autobind
    onToggle() {
        let {open} = this.state;
        this.setState({open: !open});
        const {onToggle} = this.props;
        if (onToggle) onToggle();
    }
}

function NavDrawerToggle(drawer: NavDrawer) {
    const {open} = drawer.state;
    const Arrow = open ? ArrowLeft : ArrowRight;
    return <Button variant="contained"
                   onClick={drawer.onToggle}
                   className="nav-drawer-toggle">
        <Arrow/>
    </Button>;
}
