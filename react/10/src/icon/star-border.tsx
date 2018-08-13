import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./star-border.svg";

export function StarBorder(props: SVGProps) {
    return <Svg svg={svg}
                icon="star-border"
                {...props}/>;
}
