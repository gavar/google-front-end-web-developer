import {Actor, Component} from "$engine";
import {DialogView} from "$ui";

export class OverlayView implements Component {

    /** Set of active dialogs. */
    private dialogs: Set<DialogView> = new Set<DialogView>();

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Overlay root HTML element. */
    public root: HTMLElement;

    /** @inheritDoc */
    awake() {
        this.root = document.querySelector(".overlay");
    }

    /** Notify that dialog has been shown. */
    show(dialog: DialogView) {
        if (this.dialogs.add(dialog)) {
            Component.enable(dialog);
            this.modified();
        }
    }

    /** Notify that dialog has been hidden. */
    hide(dialog: DialogView) {
        if (this.dialogs.delete(dialog)) {
            Component.disable(dialog);
            this.modified();
        }
    }

    /** Hide all dialogs. */
    close() {
        for (const dialog of this.dialogs)
            Component.disable(dialog);
    }

    /**
     * Set this overlay to be shown or hidden.
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

    private modified() {
        this.activate(this.dialogs.size > 0);
    }
}
