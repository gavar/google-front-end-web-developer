import {ExternalOption, OutputChunk, rollup} from "rollup";
import * as resolve from "rollup-plugin-node-resolve";
import {isString} from 'util';
import File from "vinyl";
import {TransformStream} from "../core";

interface RollupifyOptions {
    external?: ExternalOption
}

class Rollupify extends TransformStream {

    constructor(public readonly options?: RollupifyOptions) {
        super();
        const defaults: RollupifyOptions = {
            external: [],
        };
        this.options = Object.assign(defaults, options);
    }

    /** @inheritDoc */
    async transformBuffer(buffer: Buffer, file: File): Promise<Buffer> {

        const bundle: OutputChunk = await rollup({
            input: file.path,
            treeshake: false,
            external: this.options.external,
            plugins: [
                resolve({
                    jsnext: true,
                    main: true,
                    customResolveOptions: {
                        moduleDirectory: [
                            "node_modules",
                            "temp",
                        ]
                    }
                }),
            ]
        }) as OutputChunk;

        const output = await bundle.generate({
            name: "",
            format: 'es',
        });

        // remove external imports
        let code = output.code;
        for (let i = 0; i < this.options.external.length; i++) {
            const entry = this.options.external[i];
            if (isString(entry)) {
                const regex = new RegExp(`import.*from.*'${entry}'.*`, "g");
                code = code.replace(regex, " ");
            }
        }

        buffer = new Buffer(code.trim());
        return buffer;
    }
}

export function rollupify(options?: RollupifyOptions): Rollupify {
    return new Rollupify(options);
}
