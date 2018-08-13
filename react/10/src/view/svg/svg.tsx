import React, {ComponentType} from "react";
import "./svg.scss";

export interface SVGProps<T = SVGSVGElement> extends React.SVGProps<T> {

}

export interface SvgProps extends SVGProps {
    icon?: string;
    svg: ComponentType<SVGProps>;
}

export function Svg(props: SvgProps) {
    const {
        svg: Component,
        icon,
        children,
        ...other
    } = props;

    other.className = [
        icon && "icon",
        icon && `icon-${icon}`,
        other.className,
    ].join(" ");

    return <Component {...other}>
        {children}
    </Component>;
}
