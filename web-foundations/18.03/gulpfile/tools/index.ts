import * as beautify from "./beautify";
import {render as renderHandlebars} from "./handlebars-renderer";
import {resources} from "./html-resources";
import {responsify} from "./responsify";
import {rollupify} from "./rollupify";

export namespace render {
    export const handlebars = renderHandlebars;
}

export {
    beautify,
    rollupify,
    resources,
    responsify,
}
