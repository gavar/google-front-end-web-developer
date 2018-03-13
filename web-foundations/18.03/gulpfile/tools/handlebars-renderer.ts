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
        let data = resolveData(file.path) || {};
        let html = template(data);

        // apply
        buffer = new Buffer(html);
        file.path = gutil.replaceExtension(file.path, '.html');

        return buffer;
    }
}

const dataTypes = [".json", ".data", ""];
function resolveData(templatePath: string): any {
    for (const dataType of dataTypes) {
        try {
            const filePath = gutil.replaceExtension(templatePath, dataType);
            const absolutePath = require.resolve(filePath);
            return require(absolutePath);
        }
        catch (e) {
            /* continue */
        }
    }
    console.log(`template ${templatePath} does not provide data to render`);
}

export function render(options?: HandlebarsRendererOptions) {
    return new HandlebarsRenderer(options);
}
