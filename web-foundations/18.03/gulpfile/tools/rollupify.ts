import {ExternalOption, OutputChunk, rollup} from "rollup";
import * as buble from "rollup-plugin-buble";
import * as commonjs from "rollup-plugin-commonjs";
import * as resolve from "rollup-plugin-node-resolve";
import {GlobalsOption} from "rollup/dist/typings/rollup";
import {isString} from 'util';
import File from "vinyl";
import {TransformStream} from "../core";

interface RollupifyOptions {
    external?: ExternalOption,
    globals?: GlobalsOption,
}

class Rollupify extends TransformStream {

    constructor(public readonly options?: RollupifyOptions) {
        super();
        const defaults: RollupifyOptions = {
            external: [],
            globals: {},
        };
        this.options = Object.assign(defaults, options);
    }

    /** @inheritDoc */
    async transformBuffer(buffer: Buffer, file: File): Promise<Buffer> {

        const bundle: OutputChunk = await rollup({
            input: file.path,
            external: this.options.external,
            plugins: [
                buble({
                    transforms: {
                        dangerousForOf: true,
                    }
                }),
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
                commonjs({
                    include: 'node_modules/**'
                }),
            ]
        }) as OutputChunk;

        const output = await bundle.generate({
            format: 'iife',
            globals: this.options.globals,
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
