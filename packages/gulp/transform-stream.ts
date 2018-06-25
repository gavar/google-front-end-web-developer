import {Transform, TransformCallback} from "stream";
import Vynil from "vinyl";

export class TransformStream extends Transform {

    constructor() {
        super({objectMode: true});
    }

    /** @inheritDoc */
    _transform(file: Vynil, encoding: string, done: TransformCallback): void {
        try {
            if (file.isStream())
                return setFileContents(file, this.transformStream(file.contents, file), done);

            if (file.isBuffer())
                return setFileContents(file, this.transformBuffer(file.contents, file), done);

            done(void 0, file);
        } catch (error) {
            done(error);
        }
    }

    transformStream(stream: NodeJS.ReadableStream, file: Vynil): NodeJS.ReadableStream | Promise<NodeJS.ReadableStream> {
        throw new Error("stream transformation not implemented");
    }

    transformBuffer(buffer: Buffer, file: Vynil): Buffer | Promise<Buffer> {
        throw new Error("buffer transformation not implemented");
    }
}

function setFileContents<T extends Buffer | NodeJS.ReadableStream>(file: Vynil, contents: T | Promise<T>, done: TransformCallback): void {
    if (isPromiseLike(contents)) {
        contents.then(function (modified) {
            file.contents = modified;
            done(void 0, file);
        }, done);
    } else {
        file.contents = contents;
        done(void 0, file);
    }
}

function isPromiseLike<T = any>(value: any): value is PromiseLike<T> {
    switch (typeof value) {
        case "object":
        case "function":
            return typeof (value as PromiseLike<T>).then === "function";
    }
}
