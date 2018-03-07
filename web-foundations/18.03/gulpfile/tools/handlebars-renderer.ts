import * as gutil from "gulp-util";
import * as handlebars from "handlebars";
import {EOL} from "os";
import File from "vinyl";
import {TransformStream} from "../core";

interface HandlebarsRendererOptions {
    handlebars?: typeof handlebars;
}

class HandlebarsRenderer extends TransformStream {

    private readonly handlebars: typeof handlebars;

    constructor(options?: HandlebarsRendererOptions) {
        super();
        options = options || {};
        this.handlebars = options.handlebars || handlebars;
    }

    /** @inheritDoc */
    transformBuffer(buffer: Buffer, file: File): Buffer | Promise<Buffer> {

        // render
        const template = handlebars.compile(buffer.toString());
        let html = template({});

        // apply
        buffer = new Buffer(html);
        file.path = gutil.replaceExtension(file.path, '.html');

        return buffer;
    }
}


export function render(options?: HandlebarsRendererOptions) {
    return new HandlebarsRenderer(options);
}
