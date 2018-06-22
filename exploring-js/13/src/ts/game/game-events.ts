import {EventType} from "$/engine";
import {Bounty, Enemy, Player} from "$/game";

// TODO: move events to related classes
export namespace GameEvents {
    export const PROPERTY_CHANGED: EventType<any> = "property-changed";

    export const PLAYER_DIE: EventType<Player> = "player-die";
    export const PLAYER_HIT: EventType<Player> = "player-hit";

    export const PLAYER_ENEMY_COLLISION: EventType<Enemy> = "player-enemy-collision";
    export const PLAYER_BOUNTY_COLLISION: EventType<Bounty> = "player-bounty-collision";
}
