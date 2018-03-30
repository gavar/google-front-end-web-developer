interface Style {
    height?: number;
    minHeight?: number;
    maxHeight?: number;
}

interface Styleable {
    apply(): void;
}

const CHROME_NAVBAR_OFFSET = 74;

export class VHChromeFix {

    private active: boolean;
    private windowWidth: number;
    private windowHeight: number;
    private readonly styleables: Styleable[] = [];

    constructor() {
        const userAgent = navigator.userAgent;
        const androidChrome = /chrome/i.test(userAgent) && /android/i.test(userAgent);
        const iOSChrome = /crios/i.test(userAgent);
        this.active = androidChrome || iOSChrome;

        if (this.active) {
            // Cache window dimensions
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;

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

        if (this.active) explicitStyle.apply();
        this.styleables.push(explicitStyle);
    }

    public usePrefixStyle(elements: ArrayLike<HTMLElement>, onResize?: Function) {
        const prefixStyle = new PrefixStyle();
        prefixStyle.elements = elements;
        prefixStyle.onResize = onResize;

        if (this.active) prefixStyle.apply();
        this.styleables.push(prefixStyle);
    }

    public update(force?: boolean) {
        // Both width and height changed (orientation change)
        // This is a hack, as Android when keyboard pops up
        // Triggers orientation change
        if (force || this.windowWidth !== window.innerWidth && this.windowHeight !== window.innerHeight) {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            for (let i = 0; i < this.styleables.length; i++)
                this.styleables[i].apply();
        }
    }
}

class ExplicitStyle implements Styleable, Style {

    height?: number;
    minHeight?: number;
    maxHeight?: number;

    onResize?: Function;
    elements: ArrayLike<HTMLElement>;

    public apply() {

        let style: CSSStyleDeclaration;
        const innerHeight = window.innerHeight + CHROME_NAVBAR_OFFSET;

        for (let i = 0; i < this.elements.length; i++) {
            style = this.elements[i].style;
            style.height = this.height && `${innerHeight * this.height / 100}px`;
            style.minHeight = this.minHeight && `${innerHeight * this.minHeight / 100}px`;
            style.maxHeight = this.maxHeight && `${innerHeight * this.maxHeight / 100}px`;
        }

        if (this.onResize)
            this.onResize();
    }
}

class PrefixStyle implements Styleable {
    onResize?: Function;
    elements: ArrayLike<HTMLElement>;

    public apply() {

        let value: number;
        let style: CSSStyleDeclaration;
        let computedStyle: CSSStyleDeclaration;
        const innerHeight = window.innerHeight + CHROME_NAVBAR_OFFSET;

        for (let i = 0; i < this.elements.length; i++) {
            style = this.elements[i].style;
            computedStyle = window.getComputedStyle(this.elements[i]);

            value = computedStyle.getPropertyValue("--chrome-height") as any;
            style.height = value && `${innerHeight * value / 100}px`;

            value = computedStyle.getPropertyValue("--chrome-min-height") as any;
            style.minHeight = value && `${innerHeight * value / 100}px`;

            value = computedStyle.getPropertyValue("--chrome-max-height") as any;
            style.maxHeight = value && `${innerHeight * value / 100}px`;
        }

        if (this.onResize)
            this.onResize();
    }
}
