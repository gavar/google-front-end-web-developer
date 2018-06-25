import {Done} from "@syntax";
import {Transform} from "stream";
import File from "vinyl";

export class TransformStream extends Transform {

    constructor() {
        super({objectMode: true});
    }

    /** @inheritDoc */
    _transform(file: File, encoding: string, done: Done<File>): void {
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

    transformStream(stream: NodeJS.ReadableStream, file: File): NodeJS.ReadableStream | Promise<NodeJS.ReadableStream> {
        throw new Error("stream transformation not implemented");
    }

    transformBuffer(buffer: Buffer, file: File): Buffer | Promise<Buffer> {
        throw new Error("buffer transformation not implemented");
    }
}

function setFileContents<T extends Buffer | NodeJS.ReadableStream>(file: File, contents: T | Promise<T>, done: Done<File>): void {

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
