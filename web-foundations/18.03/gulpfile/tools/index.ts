import * as beautify from "./beautify";
import {render as renderHandlebars} from "./handlebars-renderer";

export namespace render {
    export const handlebars = renderHandlebars;
}

export {
    beautify,
}
