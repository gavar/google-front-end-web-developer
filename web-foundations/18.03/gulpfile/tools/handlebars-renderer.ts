import * as gutil from "gulp-util";
import * as handlebars from "handlebars";
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

        // data
        const data = resolveData(file.path) || {};
        const options = {
            data: {
                intl: {
                    locales: "en-US",
                },
            },
        };

        // pre-process template
        let content = buffer.toString();

        // fix 'scss' links
        content = content.replace(/.scss"/g, `.css"`);
        // fix 'ts' links
        content = content.replace(/.ts"/g, `.js"`);

        // render
        const template = this.handlebars.compile(content);
        const html = template(data, options as any);

        // apply
        buffer = new Buffer(html);
        file.path = gutil.replaceExtension(file.path, ".html");

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
        } catch (e) {
            /* continue */
        }
    }
    console.log(`template ${templatePath} does not provide data to render`);
}

export function render(options?: HandlebarsRendererOptions) {
    return new HandlebarsRenderer(options);
}
