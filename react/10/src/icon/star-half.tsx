import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./star-half.svg";

export function StarHalf(props: SVGProps) {
    return <Svg svg={svg}
                icon="star-half"
                {...props}/>;
}
