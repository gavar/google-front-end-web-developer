import React from "react";
import {Svg, SVGProps} from "../view";
import svg from "./foursquare.svg";

export function Foursquare(props: SVGProps) {
    return <Svg svg={svg}
                icon="foursquare"
                {...props}/>;
}
