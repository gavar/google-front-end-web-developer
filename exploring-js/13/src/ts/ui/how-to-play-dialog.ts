import {DialogView} from "$ui";

export class HowToPlayDialog extends DialogView {

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        return document.querySelector("#how-to-play") as HTMLElement;
    }

    /** @inheritDoc */
    protected render(): void { }
}
