import {Actor, Component} from "$engine";
import {View} from "$game";

export class Player implements Component {

    private view: View;

    /** @inheritDoc */
    readonly actor?: Actor;

    /** @inheritDoc */
    awake() {
        this.view = this.actor.require(View);
    }

    /** @inheritDoc */
    start() {
        this.view.setImage("char-boy.png");
    }
}
