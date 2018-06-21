import {DialogView} from "$ui";

export class MainMenuDialog extends DialogView {

    public play: HTMLElement;
    public howto: HTMLElement;

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        const root = document.querySelector("#main-menu") as HTMLElement;
        this.play = root.querySelector(".play");
        this.howto = root.querySelector(".how-to-play");
        this.play.addEventListener("click", () => this.actor.emit("play"));
        this.howto.addEventListener("click", () => this.actor.emit("how-to-play"));
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
