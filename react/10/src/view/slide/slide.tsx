import {classNames} from "$util";
import {tween} from "popmotion";
import React, {Component} from "react";
import {PoseAnimator, PoseAnimatorProps, PoseBehaviour, PoseController} from "../pose";
import "./slide.scss";

/**
 * Direction the component will enter from.
 */
export type SlideDirection =
    | "left"
    | "right"
    | "up"
    | "down"
    ;

export type SlidePoses = "show" | "hide";

export interface SlideProps extends PoseBehaviour<SlidePoses> {

    /**
     * Show the component, triggers enter or exit animation.
     * @default false
     */
    show?: boolean;

    /**
     * Direction node will enter from.
     * @default "right"
     */
    direction?: SlideDirection;
}

export class Slide extends Component<SlideProps> {

    static defaultProps: SlideProps = {
        show: false,
        direction: "right",
    };

    /** @inheritDoc */
    render() {
        const {show, direction, children, ...other} = this.props;
        const className = classNames(
            "slide",
            `slide-${direction}`,
        );

        const props = other as PoseAnimatorProps;
        props.pose = show ? "show" : "hide";
        props.controller = controllerByDirection(direction);
        props.attr = {className};
        return <PoseAnimator {...props}>
            {children}
        </PoseAnimator>;
    }
}

const LeftToRight: PoseController<SlidePoses> = {
    poses: {
        show: {
            x: 0,
            transition: tween,
        },
        hide: {
            x: "-100%",
            transition: tween,
        },
    },
};

function controllerByDirection(direction: SlideDirection): PoseController {
    switch (direction) {
        default:
        case "right":
            return LeftToRight;
    }
}
