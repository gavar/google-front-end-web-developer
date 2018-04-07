import * as fs from "fs-extra";
import * as path from "path";
import {Transform} from "stream";
import * as File from "vinyl";

function resolveWebPath(file: File, basePath: string, resource: string): string {
    switch (resource[0]) {
        case '/':
            return path.resolve(basePath, resource);
        default:
            const directoryPath = path.dirname(file.path).slice(file.base.length + 1);
            return path.resolve(basePath, directoryPath, resource);
    }
}

interface HtmlResourcesOptions {
    base: string;
}

class HtmlResources extends Transform {

    private readonly files: File[] = [];

    constructor(public readonly options: HtmlResourcesOptions) {
        super({objectMode: true});
    }

    /** @inheritDoc */
    _transform(file: File, encoding: string, callback: Function): void {
        this.process(file).then(callback as any, callback as any);
    }

    private async process(file: File): Promise<void> {

        const basePath = path.join(file.cwd, this.options.base);
        const content = file.contents.toString();

        // HTML
        {
            let exec: RegExpExecArray;
            const regex = /<(img|video).*?src="(.*?)"/g;
            while (exec = regex.exec(content))
                await this.dependency(file, basePath, exec[2]);
        }

        // CSS
        {
            let exec: RegExpExecArray;
            const regex = /url\("(.*?)"\)/g;
            while (exec = regex.exec(content))
                await this.dependency(file, basePath, exec[1]);
        }
    }

    private async dependency(file: File, basePath: string, dependencyPath: string): Promise<void> {
        let stat: fs.Stats;
        let contents: Buffer;
        const resolvePath = resolveWebPath(file, basePath, dependencyPath);

        try {
            stat = await fs.stat(resolvePath);
            contents = await fs.readFile(resolvePath);
        }
        catch (e) {
            return;
        }

        const resource = new File({
            cwd: file.cwd,
            base: basePath,
            path: resolvePath,
            stat: stat,
            contents: contents,
        });

        this.push(resource);
    }
}

export function resources(options: HtmlResourcesOptions) {
    return new HtmlResources(options);
}
