import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./menu.svg";

export function Menu(props: SVGProps) {
    return <Svg svg={svg}
                icon="menu"
                {...props}/>;
}
