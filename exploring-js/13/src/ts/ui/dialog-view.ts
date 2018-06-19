import {Component} from "$engine";
import {BaseView, OverlayView} from "$ui";

/** Base class for in-game dialogs.*/
export abstract class DialogView extends BaseView {

    private active: boolean;
    private initialized: boolean;

    /** Overlay tho whom this dialog belongs. */
    public overlay: OverlayView;

    /** Dialog root HTML element. */
    public root: HTMLElement;

    /** @inheritDoc */
    enable() {
        super.enable();
        if (this.initialized) {
            this.overlay.show(this);
            this.activate(true);
            this.render();
        }
    }

    /** @inheritDoc */
    start() {
        this.initialized = true;
        this.root = this.initialize();
        this.overlay = this.overlay || this.actor.stage.findComponentOfType(OverlayView);
        this.activate(this.active);
    }

    /** @inheritDoc */
    disable() {
        this.overlay.hide(this);
        this.activate(false);
    }

    /**
     * Initialize dialog and return root element.
     * @return dialog root element.
     */
    protected abstract initialize(): HTMLElement;

    /**
     * Set this dialog to be shown or hidden.
     * @param value - whether to show dialog; hide otherwise.
     */
    public activate(value: boolean): void {

        // enable / disable component
        if (value) Component.enable(this);
        else Component.disable(this);

        // update state
        this.active = value;
        if (value) this.setDirty();

        // update attributes
        if (this.root) {
            if (value) {
                this.root.setAttribute("open", "");
                this.root.removeAttribute("close");
            }
            else {
                this.root.setAttribute("close", "");
                this.root.removeAttribute("open");
            }
        }
    }
}
