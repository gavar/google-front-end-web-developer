import * as beautify from "./beautify";
import {render as renderHandlebars} from "./handlebars-renderer";
import {rollupify} from "./rollupify";
import {resources} from "./html-resources";

export namespace render {
    export const handlebars = renderHandlebars;
}

export {
    beautify,
    rollupify,
    resources,
}
