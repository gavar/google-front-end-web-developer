import {Actor, Component} from "$/engine";
import {View} from "$/game";
import {Mutable} from "@syntax";

export class Highlight implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Image name to render. */
    public imageName: string;

    /** View rendering highlight sprite. */
    public readonly view: View;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.view = this.actor.add(View);
    }

    setHighlightActive(active: boolean) {
        this.view.setImage(active ? this.imageName : null);
    }
}
