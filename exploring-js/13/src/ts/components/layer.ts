import {Actor, Component} from "$/engine";
import {Mutable} from "@syntax";

/**
 * Component for defining actor layer.
 * Actor should only have a single instance of {@link Layer} component.
 */
export class Layer implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /**
     * Layer of the actor, in range: [0;32)
     * Layers may be used for render ordering, collision intersection matrix, etc.
     */
    public readonly value: number = 0;

    /** Bitmask of of the {@link value}. */
    public readonly mask: number = 1 << this.value;

    /**
     * Set layer of the actor.
     * @param value - layer value to set.
     */
    set(this: Mutable<Layer>, value: number) {
        this.value = value || 0;
        this.mask = 1 << this.value;
    }
}
