import {Construct} from "@annotations";
import {Action} from "@syntax";
import {Transform} from "stream";
import {isString} from "util";

@Construct
export class LogStream extends Transform {

    static construct() {
        // default logging outputs
        this.prototype.log = console.log;
        this.prototype.logger = console;

        // default chunk string transformation
        this.prototype.stringify = function (chunk: any): string {
            return isString(chunk) ? chunk : chunk.toString();
        };
    }

    /** Create logger that writes to console. */
    public static console(log?: (message: string) => void) {
        return new LogStream(log || console.log, console);
    }

    /** Creates new instance of {@link LogStream}. */
    public static to(log: (message: string) => void, logger?: any) {
        return new LogStream(log, logger);
    }

    /** Logger instance that holds {@link #log} function (optional). */
    private logger: any;

    /** Function that writes messages to a log. */
    private log: (message: string) => void;

    /** Incoming chung transformation to string. */
    private stringify: (chung: any) => string;

    constructor(log: (message: string) => void, logger?: any) {
        super({objectMode: true});
        this.log = log;
        this.logger = logger;
    }

    message<T = any>(value?: (T: any) => string): this {
        if (value) this.stringify = value;
        else delete this.stringify;
        return this;
    }

    _transform(chunk: any, encoding: string, done: Action): void {
        const message = this.stringify(chunk);

        let index: number;
        let offset: number = 0;
        while ((index = message.indexOf("\n", offset)) >= 0) {
            this.log.call(this.logger, message.slice(offset, index));
            offset = index + 1;
        }

        if (!offset || offset < message.length)
            this.log.call(this.logger, message.slice(offset));

        this.push(chunk, encoding);
        done();
    }
}
