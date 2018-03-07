import * as beautify from "js-beautify";
import {EOL} from "os";
import {TransformStream} from "../core";

type Beautifier<T> = (text: string, options?: T) => string;

class BeautifyStream<T> extends TransformStream {

    constructor(readonly beautifier: Beautifier<T>,
                readonly options?: T) {
        super()
    }

    /** @inheritDoc */
    transformBuffer(buffer: Buffer): Buffer | Promise<Buffer> {

        // beautify
        let contents = buffer.toString();
        contents = this.beautifier(contents, this.options);

        // apply
        return new Buffer(contents);
    }
}

export function js(options?: JsBeautifyOptions): BeautifyStream<JsBeautifyOptions> {
    const defaults: JsBeautifyOptions = {
        eol: EOL,
        indent_size: 2,
        end_with_newline: true,
        preserve_newlines: false,
    };
    return new BeautifyStream(beautify.js, Object.assign(defaults, options));
}

export function html(options?: HTMLBeautifyOptions): BeautifyStream<HTMLBeautifyOptions> {
    const defaults: HTMLBeautifyOptions = {
        eol: EOL,
        indent_size: 2,
        end_with_newline: true,
        preserve_newlines: false,
    };
    return new BeautifyStream(beautify.html, Object.assign(defaults, options));
}

export function css(options?: CSSBeautifyOptions): BeautifyStream<CSSBeautifyOptions> {
    const defaults: CSSBeautifyOptions = {
        eol: EOL,
        indent_size: 2,
        end_with_newline: true,
    };
    return new BeautifyStream(beautify.css, Object.assign(defaults, options));
}

interface JsBeautifyOptions {
    indent_size?: number;
    indent_char?: string;
    eol?: string;
    indent_level?: number;
    indent_with_tabs?: boolean;
    preserve_newlines?: boolean;
    max_preserve_newlines?: number;
    jslint_happy?: boolean;
    space_after_anon_function?: boolean;
    brace_style?: 'collapse-preserve-inline' | 'collapse' | 'expand' | 'end-expand' | 'none';
    keep_array_indentation?: boolean;
    keep_function_indentation?: boolean;
    space_before_conditional?: boolean;
    break_chained_methods?: boolean;
    eval_code?: boolean;
    unescape_strings?: boolean;
    wrap_line_length?: number;
    wrap_attributes?: 'auto' | 'force';
    wrap_attributes_indent_size?: number;
    end_with_newline?: boolean;
}

interface HTMLBeautifyOptions {
    indent_size?: number;
    indent_char?: string;
    indent_with_tabs?: boolean;
    indent_handlebars?: boolean;
    eol?: string;
    end_with_newline?: boolean;
    preserve_newlines?: boolean;
    max_preserve_newlines?: number;
    indent_inner_html?: boolean;
    brace_style?: 'collapse-preserve-inline' | 'collapse' | 'expand' | 'end-expand' | 'none';
    indent_scripts?: 'keep' | 'separate' | 'normal';
    wrap_line_length?: number;
    wrap_attributes?: 'auto' | 'force';
    wrap_attributes_indent_size?: number;
    unformatted?: string[];
    content_unformatted?: string[];
    extra_liners?: string | string[];
}

interface CSSBeautifyOptions {
    indent_size?: number;
    indent_char?: string;
    indent_with_tabs?: boolean;
    eol?: string;
    end_with_newline?: boolean;
    selector_separator_newline?: boolean;
    newline_between_rules?: boolean;
}
