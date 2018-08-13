import {Configuration} from "webpack";
import {Configurer} from "..";
import {svgLoader} from "../loaders";

export function configureSVG(config: Configuration, configurer: Configurer): void {
    // rules
    const {module} = config;
    module.rules.push(svgLoader());
}
