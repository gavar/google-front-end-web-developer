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

    /** List of elements to replicate same attributes state. */
    public slaves: HTMLElement[];

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
     * @param active - whether to show dialog; hide otherwise.
     */
    public activate(active: boolean): void {

        // update attributes
        DialogView.setStateAttributes(active, this.root);

        // enable / disable component
        if (active) Component.enable(this);
        else Component.disable(this);

        // update state
        this.active = active;
        if (active) this.setDirty();
    }

    public static setStateAttributes(value: boolean, element: HTMLElement) {
        if (element) {
            if (value) {
                element.setAttribute("ready", "");
                element.setAttribute("open", "");
                element.removeAttribute("hide");
            }
            else if (element.hasAttribute("ready")) {
                element.setAttribute("hide", "");
                element.removeAttribute("open");
            }
        }
    }
}
