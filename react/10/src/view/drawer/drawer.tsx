import {classNames} from "$util";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {Dialog, PoseStatus} from "../";
import {Slide, SlideDirection, SlidePose} from "../slide";

import "./drawer.scss";

export type DrawerVariant =
    | "persistent"
    | "temporary"
    ;

export type DrawerAnchor =
    | "left"
    ;

export interface DrawerProps {

    /**
     * Drawer type to use.
     * @default "temporary"
     */
    variant?: DrawerVariant;

    /**
     * Side from which the drawer will appear.
     * @default "left"
     */
    anchor?: DrawerAnchor;

    /** Class name. */
    className?: string;

    /**
     * Whether drawer should be open.
     * @default false
     */
    open?: boolean;
}

interface DrawerState {
    status: PoseStatus;
}

export class Drawer extends Component<DrawerProps, DrawerState> {

    public static readonly defaultProps: DrawerProps = {
        variant: "temporary",
        anchor: "left",
    };

    constructor(props, context) {
        super(props, context);
        this.state = {status: PoseStatus.exited};
    }

    /** @inheritDoc */
    render() {
        const {status} = this.state;
        const open = status >= PoseStatus.exiting;
        const show = this.props.open;

        const {variant, anchor, children} = this.props;
        const direction = anchorToDirection(anchor);
        const className = classNames(
            "drawer",
            `drawer-${variant}`,
            `${PoseStatus[status]}`,
            this.props.className,
        );

        const drawer = <div className="drawer-container">
            {children}
        </div>;

        const slide = <Slide show={show}
                             direction={direction}
                             onStateTransition={this.onSlideStateTransition}>
            {drawer}
        </Slide>;

        if (variant === "persistent")
            return <div className={className}>
                {slide}
            </div>;

        // variant === temporary (by default)
        return <Dialog open={open}
                       className={className}>
            {slide}
        </Dialog>;
    }

    @autobind
    onSlideStateTransition(state: SlidePose, status: PoseStatus) {
        switch (state) {
            case "show":
                this.setState({status});
                break;
        }
    }
}

function anchorToDirection(anchor: DrawerAnchor): SlideDirection {
    switch (anchor) {
        default:
        case "left":
            return "right";
    }
}
