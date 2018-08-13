import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./arrow-right.svg";

export function ArrowRight(props: SVGProps) {
    return <Svg svg={svg}
                icon="arrow-right"
                {...props}/>;
}
