import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./star.svg";

export function Star(props: SVGProps) {
    return <Svg svg={svg}
                icon="star"
                {...props}/>;
}
