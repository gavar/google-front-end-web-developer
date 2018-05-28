import {Resources, Sprite} from "$components";
import {Actor, Component} from "$engine";

export class Player implements Component {

    private sprite: Sprite;
    private resources: Resources;

    /** @inheritDoc */
    readonly actor: Actor;

    /** @inheritDoc */
    awake() {
        this.sprite = this.actor.add(Sprite);
    }

    /** @inheritDoc */
    start() {
        this.resources = this.actor.stage.findComponentOfType(Resources);
        this.resources.load("char-boy.png").then(image => this.sprite.image = image);
    }

    /** @inheritDoc */
    destroy() {
        this.actor.remove(this.sprite);
        this.sprite = null;
    }
}

