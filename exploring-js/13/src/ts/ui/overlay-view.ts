import {Actor, Component} from "$engine";
import {DialogView} from "$ui";

export class OverlayView implements Component {

    /** Set of active dialogs. */
    private dialogs: Set<DialogView> = new Set<DialogView>();

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Overlay root HTML element. */
    public main: HTMLElement;

    /** Overlay root HTML element. */
    public root: HTMLElement;

    /** @inheritDoc */
    awake() {
        this.main = document.querySelector("main");
        this.root = document.querySelector(".overlay");
    }

    /** Notify that dialog has been shown. */
    show(dialog: DialogView) {
        if (this.dialogs.add(dialog)) {
            dialog.activate(true);
            this.modified();
        }
    }

    /** Notify that dialog has been hidden. */
    hide(dialog: DialogView) {
        if (this.dialogs.delete(dialog)) {
            dialog.activate(false);
            this.modified();
        }
    }

    /** Hide all dialogs. */
    close() {
        for (const dialog of this.dialogs)
            this.hide(dialog);
    }

    /**
     * Set this overlay to be shown or hidden.
     * @param active - whether to show dialog; hide otherwise.
     */
    protected activate(active: boolean): void {
        const {root, main} = this;
        DialogView.setStateAttributes(active, root);
        DialogView.setStateAttributes(active, main);
    }

    private modified() {
        this.activate(this.dialogs.size > 0);
    }
}
