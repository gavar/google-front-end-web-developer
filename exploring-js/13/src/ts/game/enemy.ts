import {Motor, Sort, Transform} from "$components";
import {Component} from "$engine";
import {Actor} from "$engine/actor";
import {View} from "$game";

export class Enemy implements Component {

    /** @inheritDoc */
    readonly actor?: Actor;

    public sort: Sort;
    public view: View;
    public motor: Motor;
    public transform: Transform;

    /** @inheritDoc */
    awake() {
        this.sort = this.actor.require(Sort);
        this.transform = this.actor.require(Transform);
    }
}
