import * as gutil from "gulp-util";
import * as handlebars from "handlebars";
import * as beautify from "js-beautify";
import {EOL} from "os";
import File from "vinyl";
import {TransformStream} from "../core";

interface HandlebarsRendererOptions {
    handlebars?: typeof Handlebars;
}

export class HandlebarsRendererStream extends TransformStream {

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

        // beautify
        html = beautify.html(html, {
            eol: EOL,
            indent_size: 2,
            end_with_newline: true,
            preserve_newlines: false,
        });

        // apply
        buffer = new Buffer(html);
        file.path = gutil.replaceExtension(file.path, '.html');

        return buffer;
    }
}
