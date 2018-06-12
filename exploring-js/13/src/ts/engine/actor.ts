import {EventEmitter, EventType} from "$engine";
import {Newable} from "@syntax";
import {Component} from "./component";
import {Stage} from "./stage";

/**
 * Stage actor that can have behavioural components.
 */
export class Actor extends EventEmitter {

    public static readonly DESTROYING: EventType<Actor> = "destroying";
    public static readonly DESTROYED: EventType<Actor> = "destroyed";

    /** Number of actors created. */
    private static counter: number = 0;

    /**
     * Name of the actor.
     * @default actor
     */
    public name: string;

    /**
     * Whether actor is active or not.
     * @default true
     */
    public active: boolean;

    /** Unique identifier of an actor for debug purposes. */
    public readonly id: number;

    /** Stage to which this actor belongs to. */
    public readonly stage: Stage;

    /** List of this actor components. */
    public readonly components: ReadonlyArray<Component>;

    /** Whether actor has been destroyed. */
    public get destroyed(): boolean {
        return !this.stage
            || this.stage.isActorDestroyed(this)
            ;
    }

    /** Initialize new instance of an actor. */
    constructor() {
        super();
        this.id = ++Actor.counter;
    }

    /**
     * Add component of the given type to an actor.
     * @param type - type of component to add.
     * @returns - instance of added component.
     */
    add<T>(type: Newable<T>): T & Component {
        return this.stage.addComponent(this, type);
    }

    /**
     * Find component of given type on this actor.
     * @param type - type of the component to search for.
     * @returns component of requested type on success; otherwise undefined.
     */
    get<T>(type: Newable<T>): T & Component {
        for (const component of this.components)
            if (component instanceof type)
                return component as any;
    }

    /**
     * Get or add component of the given type.
     * @param type - type of the component to find or create.
     * @returns - component instance of given type.
     */
    require<T>(type: Newable<T>): T & Component {
        return this.get(type) || this.add<T>(type);
    }

    /**
     * Remove component from the actor.
     * @param component - component to remove.
     */
    remove(component: Component): void {
        this.stage.destroyComponent(this, component);
    }

    /**
     * Destroy this actor and all of its components.
     */
    destroy() {
        this.emit(Actor.DESTROYING, this);
        this.stage.destroyActor(this);
        this.emit(Actor.DESTROYED, this);
        this.removeAllListeners();
    }
}

// 'Actor' defaults
Actor.prototype.name = "actor";
Actor.prototype.active = true;
