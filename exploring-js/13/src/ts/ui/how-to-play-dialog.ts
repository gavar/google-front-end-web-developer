import {DialogView} from "$/ui";

export class HowToPlayDialog extends DialogView {

    public back: HTMLElement;

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        const root = document.querySelector<HTMLElement>("#how-to-play");
        this.back = root.querySelector(".back");
        this.back.addEventListener("click", () => this.actor.emit("back"));
        return root;
    }

    /** @inheritDoc */
    protected render(): void {
        // nothing to do here
    }

    /** @inheritDoc */
    activate(active: boolean): void {
        super.activate(active);
        DialogView.setStateAttributes(active, this.root.parentElement);
    }
}
