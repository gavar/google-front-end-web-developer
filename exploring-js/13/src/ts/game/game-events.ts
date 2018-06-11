import {EventType} from "$engine";
import {Bounty, Enemy} from "$game";

export namespace GameEvents {
    export const PLAYER_HIT_BY: EventType<Enemy> = "player-hit-by";
    export const PLAYER_COLLECT_BOUNTY: EventType<Bounty> = "player-collect-bounty";
}
