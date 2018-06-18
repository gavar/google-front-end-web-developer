import {BaseView, OverlayView} from "$ui";

/** Base class for in-game dialogs.*/
export abstract class DialogView extends BaseView {

    private initialized: boolean;

    /** Overlay tho whom this dialog belongs. */
    public overlay: OverlayView;

    /** Dialog root HTML element. */
    public root: HTMLElement;

    /** @inheritDoc */
    enable() {
        super.enable();
        if (!this.initialized) return;
        this.overlay.show(this);
        this.activate(true);
        this.render();
    }

    /** @inheritDoc */
    start() {
        this.initialized = true;
        this.root = this.initialize();
        this.overlay = this.overlay || this.actor.stage.findComponentOfType(OverlayView);
        this.activate(true);
        this.render();
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
     * @param open - whether to show dialog; hide otherwise.
     */
    protected activate(open: boolean): void {
        if (open) {
            this.root.setAttribute("open", "");
            this.root.removeAttribute("close");
        }
        else {
            this.root.setAttribute("close", "");
            this.root.removeAttribute("open");
        }
    }
}
