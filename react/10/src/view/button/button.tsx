import {classNames} from "$util";
import React, {Component} from "react";
import {ButtonColorType} from "../types";
import {ButtonBase, ButtonBaseProps} from "./button-base";
import "./button.scss";

export type ButtonVariant =
    | "text" // https://material.io/design/components/buttons.html#text-button
    ;

export interface ButtonProps extends ButtonBaseProps {
    variant?: ButtonVariant;
    color?: ButtonColorType;
}

/**
 * Button with different variants.
 * @see https://material.io/design/components/buttons.html
 */
export class Button extends Component<ButtonProps> {

    static readonly defaultProps: ButtonProps = {
        color: "default",
        variant: "text",
    };

    /** @inheritDoc */
    render() {
        const {color, variant, ...other} = this.props;
        const props: ButtonProps = other;

        const text = variant === "text";
        props.className = classNames(
            "button",
            text && "text",
            props.className,
        );

        if (color !== "default")
            props.color = color;

        return <ButtonBase {...props}/>;
    }
}
