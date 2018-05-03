import {Callback} from "@syntax";
import {Transform} from "stream";
import File from "vinyl";

export class TransformStream extends Transform {

    constructor() {
        super({objectMode: true});
    }

    /** @inheritDoc */
    _transform(file: File, encoding: string, callback: Callback<File>): void {
        try {
            if (file.isStream())
                return setFileContents(file, this.transformStream(file.contents, file), callback);

            if (file.isBuffer())
                return setFileContents(file, this.transformBuffer(file.contents, file), callback);

            callback(void 0, file);
        } catch (error) {
            callback(error);
        }
    }

    transformStream(stream: NodeJS.ReadableStream, file: File): NodeJS.ReadableStream | Promise<NodeJS.ReadableStream> {
        throw new Error("stream transformation not implemented");
    }

    transformBuffer(buffer: Buffer, file: File): Buffer | Promise<Buffer> {
        throw new Error("buffer transformation not implemented");
    }
}

function setFileContents<T extends Buffer | NodeJS.ReadableStream>(file: File, contents: T | Promise<T>, callback: Callback<File>): void {

    if (isPromiseLike(contents)) {
        contents.then(function (modified) {
            file.contents = modified;
            callback(void 0, file);
        }, callback);
    } else {
        file.contents = contents;
        callback(void 0, file);
    }
}

function isPromiseLike<T = any>(value: any): value is PromiseLike<T> {
    switch (typeof value) {
        case "object":
        case "function":
            return typeof (value as PromiseLike<T>).then === "function";
    }
}
