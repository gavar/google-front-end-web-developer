import {RuleSetRule} from "webpack";

export function svgLoader(): RuleSetRule {
    return {
        test: /\.svg$/,
        loader: "react-svg-loader",
    };
}
