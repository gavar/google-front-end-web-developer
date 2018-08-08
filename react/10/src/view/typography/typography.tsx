import React, {Component, HTMLAttributes, ReactType} from "react";
// import "./typography.scss";

export type TypographyVariant =
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant?: TypographyVariant,
    component?: ReactType<HTMLAttributes<HTMLElement>>;
}

export class Typography extends Component<TypographyProps> {

    render() {
        const {
            variant,
            component,
            children,
            ...other
        } = this.props;

        // do note render empty
        if (!children)
            return null;

        const Component = component || variants[variant] || "div";
        return <Component {...other}>
            {children}
        </Component>;
    }
}

const variants = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
};
