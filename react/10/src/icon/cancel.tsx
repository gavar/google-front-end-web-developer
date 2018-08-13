import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./cancel.svg";

export function Cancel(props: SVGProps) {
    return <Svg svg={svg}
                icon="cancel"
                {...props}/>;
}
