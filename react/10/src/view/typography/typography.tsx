import {classNames} from "$util";
import React, {Component, HTMLAttributes, ReactType} from "react";
import "./typography.scss";

export type TypographyVariant =
    | "headline"
    | "title"
    | "subheading"
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

        other.className = classNames(
            variant,
            other.className,
        );

        const Component = component || variants[variant] || "div";

        return <Component {...other}>
            {children}
        </Component>;
    }
}

const variants = {
    headline: "h1",
    title: "h2",
    subheading: "h3",
    body: "p",
};
