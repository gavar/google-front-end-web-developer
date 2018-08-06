import {classNames} from "$util";
import React, {ButtonHTMLAttributes, Component} from "react";
import {ButtonType, ColorType} from "../types";
import "./button.scss";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    type?: ButtonType;
    color?: ColorType;
}

export class Button extends Component<ButtonProps> {

    public static readonly defaultProps: ButtonProps = {
        type: "button",
    };

    /** @inheritDoc */
    render() {
        const {color, children, ...other} = this.props;

        other.className = classNames(
            "button",
            color && `button-${color}`,
            other.className,
        );

        return <button {...other}>
            {children}
        </button>;
    }
}
