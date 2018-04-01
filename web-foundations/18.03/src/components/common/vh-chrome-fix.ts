interface Style {
    height?: number;
    minHeight?: number;
    maxHeight?: number;
}

interface Styleable {
    apply(height: number): void;
}

function windowHeight() {
    // devices have tiny bar at the top which shows charge level, we assume its height is 20px
    let size = window.innerHeight >= window.innerWidth ? screen.height : screen.width;
    if (window.innerHeight < size) size -= 20;
    return size;
}

export class VHChromeFix {

    private active: boolean;
    private readonly styleables: Styleable[] = [];

    constructor() {
        const userAgent = navigator.userAgent;
        const androidChrome = /chrome/i.test(userAgent) && /android/i.test(userAgent);
        const iOSChrome = /crios/i.test(userAgent);

        // HACK: devtools doesn't have menu bar
        const fullscreen = window.innerHeight == screen.height || window.innerHeight == screen.width;
        this.active = !fullscreen && androidChrome || iOSChrome;

        if (this.active) {
            // BUG: do not change to .bind(this)
            const update = () => this.update();
            window.addEventListener('resize', update);
            window.addEventListener('orientationchange', update);
        }
    }

    public setStyleBySelector(selector: string, style: Style, onResize?: Function) {
        this.setStyle(document.querySelectorAll<HTMLElement>(selector), style, onResize);
    }

    public setStyle(elements: ArrayLike<HTMLElement>, style: Style, onResize?: Function) {
        const explicitStyle = new ExplicitStyle();
        Object.assign(explicitStyle, style);
        explicitStyle.elements = elements;
        explicitStyle.onResize = onResize;

        const height = windowHeight();
        if (this.active) explicitStyle.apply(height);
        this.styleables.push(explicitStyle);
    }

    public usePrefixStyle(elements: ArrayLike<HTMLElement>, onResize?: Function) {
        const prefixStyle = new PrefixStyle();
        prefixStyle.elements = elements;
        prefixStyle.onResize = onResize;

        const height = windowHeight();
        if (this.active) prefixStyle.apply(height);
        this.styleables.push(prefixStyle);
    }

    public update() {
        const height = windowHeight();
        for (let i = 0; i < this.styleables.length; i++)
            this.styleables[i].apply(height);
    }
}

class ExplicitStyle implements Styleable, Style {

    height?: number;
    minHeight?: number;
    maxHeight?: number;

    onResize?: Function;
    elements: ArrayLike<HTMLElement>;

    public apply(height: number) {

        let style: CSSStyleDeclaration;

        for (let i = 0; i < this.elements.length; i++) {
            style = this.elements[i].style;
            style.height = this.height && `${height * this.height / 100}px`;
            style.minHeight = this.minHeight && `${height * this.minHeight / 100}px`;
            style.maxHeight = this.maxHeight && `${height * this.maxHeight / 100}px`;
        }

        if (this.onResize)
            this.onResize();
    }
}

class PrefixStyle implements Styleable {
    onResize?: Function;
    elements: ArrayLike<HTMLElement>;

    public apply(height: number) {

        let value: number;
        let style: CSSStyleDeclaration;
        let computedStyle: CSSStyleDeclaration;

        for (let i = 0; i < this.elements.length; i++) {
            style = this.elements[i].style;
            computedStyle = window.getComputedStyle(this.elements[i]);

            value = computedStyle.getPropertyValue("--chrome-height") as any;
            style.height = value && `${height * value / 100}px`;

            value = computedStyle.getPropertyValue("--chrome-min-height") as any;
            style.minHeight = value && `${height * value / 100}px`;

            value = computedStyle.getPropertyValue("--chrome-max-height") as any;
            style.maxHeight = value && `${height * value / 100}px`;
        }

        if (this.onResize)
            this.onResize();
    }
}
