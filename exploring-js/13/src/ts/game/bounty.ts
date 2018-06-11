import {Layer, Transform} from "$components";
import {Actor, Component} from "$engine";
import {Highlight, View} from "$game";
import {Mutable} from "@syntax";

export class Bounty implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    public readonly view: View;
    public readonly layer: Layer;
    public readonly transform: Transform;
    public readonly highlight: Highlight;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.view = this.actor.add(View);
        this.layer = this.actor.add(Layer);
        this.highlight = this.actor.add(Highlight);
        this.transform = this.actor.require(Transform);
    }
}
