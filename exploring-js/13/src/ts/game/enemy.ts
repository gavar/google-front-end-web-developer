import {Layer, Motor, Transform} from "$components";
import {Actor, Component} from "$engine";
import {View} from "$game";
import {Mutable} from "@syntax";

export class Enemy implements Component {

    /** @inheritDoc */
    readonly actor?: Actor;

    public readonly layer: Layer;
    public readonly transform: Transform;

    public view: View;
    public motor: Motor;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.layer = this.actor.require(Layer);
        this.transform = this.actor.require(Transform);
    }
}
