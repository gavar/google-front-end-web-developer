import {Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty} from "$game";

export class BountySpawn implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Factory which creates new {@link Bounty} instance on request. */
    public bountyFactory: () => Bounty;

    /** Spawn bounty on the given position. */
    spawn(position: Readonly<Vector2>): Bounty {
        const bounty = this.bountyFactory();
        const {transform} = bounty;
        transform.position.x = position.x;
        transform.position.y = position.y;
        return bounty;
    }
}
