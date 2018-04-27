import {Construct} from "@annotations";
import {Transform} from "stream";
import {isString} from "util";

@Construct
export class LogStream extends Transform {

    static construct() {
        // default logging outputs
        this.prototype._log = console.log;
        this.prototype._logger = console;

        // default chunk string transformation
        this.prototype._stringify = function (chunk: any): string {
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
    private _logger: any;

    /** Function that writes messages to a log. */
    private _log: (message: string) => void;

    /** Incoming chung transformation to string. */
    private _stringify: (chung: any) => string;

    constructor(log: (message: string) => void, logger?: any) {
        super({objectMode: true});
        this._log = log;
        this._logger = logger;
    }

    message<T = any>(value?: (T: any) => string): this {
        if (value) this._stringify = value;
        else delete this._stringify;
        return this;
    }

    _transform(chunk: any, encoding: string, callback: Function): void {
        const message = this._stringify(chunk);

        let offset, index: number;
        while ((index = message.indexOf("\n", offset)) >= 0) {
            this._log.call(this._logger, message.slice(offset, index));
            offset = index + 1;
        }

        if (!offset || offset < message.length)
            this._log.call(this._logger, message.slice(offset));

        this.push(chunk, encoding);
        callback();
    }
}
