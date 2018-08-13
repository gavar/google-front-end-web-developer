import React, {ButtonHTMLAttributes, Component, ReactType} from "react";
import {ButtonType} from "../types";

export interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLElement> {
    type?: ButtonType;
    disabled?: boolean;
    component?: ReactType,
}

/** Building block for a button-like behaviour. */
export class ButtonBase extends Component<ButtonBaseProps> {

    static readonly defaultProps: ButtonBaseProps = {
        type: "button",
        component: "button",
    };

    render() {
        const {type, disabled, component: Component, ...other} = this.props;
        const props: ButtonBaseProps = other;

        if (Component === "button") {
            props.type = type || "button";
            props.disabled = disabled;
        }
        else {
            other.role = "button";
        }

        if (disabled)
            props.tabIndex = -1;

        return <Component {...other}/>;
    }
}
