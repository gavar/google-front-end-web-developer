import {Actor, Component} from "$engine";
import {View} from "$game";

export class Player implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    public view: View;

    /** @inheritDoc */
    start() {
        this.view = this.view || this.actor.require(View);
        this.view.setImage("char-boy.png");
    }
}
