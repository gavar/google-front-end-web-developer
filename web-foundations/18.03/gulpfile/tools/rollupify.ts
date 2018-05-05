import {GlobalsOption, OutputChunk, rollup} from "rollup";
import * as buble from "rollup-plugin-buble";
import * as commonjs from "rollup-plugin-commonjs";
import * as resolve from "rollup-plugin-node-resolve";
import {isString} from "util";
import File from "vinyl";
import {TransformStream} from "../core";

interface RollupifyOptions {
    external: string[];
    globals: GlobalsOption;
}

class Rollupify extends TransformStream {

    public readonly options: RollupifyOptions;

    constructor(options?: Partial<RollupifyOptions>) {
        super();
        this.options = {
            external: [],
            globals: {},
            ...options,
        };
    }

    /** @inheritDoc */
    async transformBuffer(buffer: Buffer, file: File): Promise<Buffer> {

        const bundle = await rollup({
            input: file.path,
            external: this.options.external,
            plugins: [
                buble({
                    transforms: {
                        dangerousForOf: true,
                    },
                }),
                resolve({
                    jsnext: true,
                    main: true,
                    customResolveOptions: {
                        moduleDirectory: [
                            "node_modules",
                            "temp",
                        ],
                    },
                }),
                commonjs({
                    include: "node_modules/**",
                }),
            ],
        }) as OutputChunk;

        const output = await bundle.generate({
            format: "iife",
            globals: this.options.globals,
        });

        // remove external imports
        let code = output.code;
        for (const entry of this.options.external) {
            if (isString(entry)) {
                const regex = new RegExp(`import.*from.*'${entry}'.*`, "g");
                code = code.replace(regex, " ");
            }
        }

        buffer = new Buffer(code.trim());
        return buffer;
    }
}

export function rollupify(options?: Partial<RollupifyOptions>): Rollupify {
    return new Rollupify(options);
}
