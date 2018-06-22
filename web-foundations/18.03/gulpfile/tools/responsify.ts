import fs from "fs-extra";
import im from "imagemagick";
import {JSDOM} from "jsdom";
import path from "path";
import File from "vinyl";
import {TransformStream} from "../core";

function resolveWebPath(file: File, basePath: string, resource: string): string {
    switch (resource[0]) {
        case "/":
            return path.resolve(basePath, resource);
        default:
            const directoryPath = path.dirname(file.path).slice(file.base.length + 1);
            return path.resolve(basePath, directoryPath, resource);
    }
}

async function resolveImage(html: File, basePath: string, imagePath: string): Promise<File> {
    let stat: fs.Stats;
    let contents: Buffer;
    const resolvePath = resolveWebPath(html, basePath, imagePath);

    stat = await fs.stat(resolvePath);
    contents = await fs.readFile(resolvePath);

    return new File({
        cwd: html.cwd,
        base: basePath,
        path: resolvePath,
        stat,
        contents,
    });
}

async function resize(options: im.Options): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        im.resize(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

async function identify(filename: string): Promise<im.Features> {
    return new Promise<im.Features>((resolve, reject) => {
        im.identify(filename, (error, features) => {
            if (error) reject(error);
            else resolve(features);
        });
    });
}

interface ResponsifyOptions {
    base: string;
}

class Responsify extends TransformStream {

    constructor(public readonly options: ResponsifyOptions) {
        super();
    }

    async transformBuffer(buffer: Buffer, file: File): Promise<Buffer> {

        const jsdom = new JSDOM(buffer, {runScripts: "outside-only"});
        const document = jsdom.window.document;
        const images = document.querySelectorAll<HTMLImageElement>("img");

        for (const image of images) {
            const sizes = image.getAttribute("data-img-sizes");
            if (!sizes) continue;

            image.removeAttribute("data-img-sizes");
            const widths = sizes.split(",").map(Number);
            if (widths.length < 1) continue;

            // push image file itself
            const imagePath = image.getAttribute("data-src");
            const imageFile = await resolveImage(file, this.options.base, imagePath);
            this.push(imageFile);

            try {
                const sources: string[] = [];
                const features = await identify(imageFile.path);

                // this required since srcset doesn't work with max-width: 100%
                image.style.maxWidth = `${features.width}px`;
                image.style.maxHeight = `${features.height}px`;

                for (const width of widths) {
                    // avoid upscaling
                    if (features.width < width)
                        continue;

                    const ext = path.extname(imageFile.path);
                    const imagePath = `${imageFile.path.slice(0, -ext.length)}-${width}${ext}`;

                    await resize({
                        srcData: imageFile.contents as any,
                        dstPath: imagePath,
                        width,
                    });

                    const resizeImage = new File({
                        cwd: imageFile.cwd,
                        base: imageFile.base,
                        path: imagePath,
                        contents: await fs.readFile(imagePath),
                    });

                    // remove file after completion, since imagemagick works only if path specified
                    await fs.remove(imagePath);

                    const relativePath = path.relative(resizeImage.base, resizeImage.path);
                    sources.push(`${relativePath} ${width}w`);
                    this.push(resizeImage);
                }

                // include self as max-width image
                const relativePath = path.relative(imageFile.base, imageFile.path);
                sources.push(`${relativePath} ${features.width}w`);

                // override attribute value
                image.setAttribute("data-srcset", sources.join(","));
            } catch (e) {
                console.error(e);
            }
        }

        buffer = new Buffer(jsdom.serialize());
        return buffer;
    }
}

export function responsify(options: ResponsifyOptions) {
    return new Responsify(options);
}
