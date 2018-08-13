import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./arrow-left.svg";

export function ArrowLeft(props: SVGProps) {
    return <Svg svg={svg}
                icon="arrow-left"
                {...props}/>;
}
