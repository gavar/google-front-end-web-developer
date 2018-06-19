import {DialogView} from "$ui";

export class HowToPlayDialog extends DialogView {

    public play: HTMLElement;

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        const root = document.querySelector<HTMLElement>("#how-to-play");
        this.play = root.querySelector(".play");
        this.play.addEventListener("click", () => this.actor.emit("play"));
        return root;
    }

    /** @inheritDoc */
    protected render(): void { }
}
