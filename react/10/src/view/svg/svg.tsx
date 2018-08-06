import React, {ComponentType} from "react";
import "./svg.scss";

export interface SVGProps<T = SVGSVGElement> extends React.SVGProps<T> {

}

export interface SvgProps extends SVGProps {
    icon?: string;
    svg: ComponentType<SVGProps>;
}

export function Svg(props: SvgProps) {
    const {svg: SVG, icon, children, ...other} = this.props;

    other.className = [
        icon && "icon",
        icon && `icon-${icon}`,
        other.className,
    ].join(" ");

    return <SVG {...other}>
        {children}
    </SVG>;
}
