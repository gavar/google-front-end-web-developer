import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./search.svg";

export function Search(props: SVGProps) {
    return <Svg svg={svg}
                icon="search"
                {...props}/>;
}
