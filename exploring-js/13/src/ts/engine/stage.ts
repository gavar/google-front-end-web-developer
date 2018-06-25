import {Mutable, Newable} from "@syntax";
import {Actor} from "./actor";
import {Bag, BagSet} from "./bag";
import {Component} from "./component";
import {System} from "./system";

/** Component queue state. */
interface QueueState {

    /** Whether component has been enabled for the first time? */
    enabled: boolean;

    /** Whether component has been started before first update. */
    started: boolean;
}

/**
 * Main object of the ECS system which manages actors, components and systems.
 */
export class Stage {

    private readonly queue: Map<Component, QueueState>;
    private readonly actors: BagSet<Mutable<Actor>>;
    private readonly systems: BagSet<System>;
    private readonly destroyActors: BagSet<Actor>;
    private readonly destroyComponents: BagSet<Component>;

    constructor() {
        this.queue = new Map<Component, QueueState>();
        this.actors = new BagSet<Mutable<Actor>>();
        this.systems = new BagSet<System>();
        this.destroyActors = new BagSet<Actor>();
        this.destroyComponents = new BagSet<Component>();
    }

    /** Start stage updates. */
    start(): void {
        let lastTime;
        const stage: FrameRequestCallback = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            this.tick(deltaTime / 1000);
            window.requestAnimationFrame(stage);
        };
        window.requestAnimationFrame((time: number) => {
            lastTime = time;
            window.requestAnimationFrame(stage);
        });
    }

    /**
     * Add system to receive updates.
     * @param system - system to add.
     */
    addSystem(system: System) {
        // check system already exists
        if (this.systems.has(system))
            return;

        // ensure there's no duplicate systems of the same type
        for (const existing of this.systems.items)
            if (system.constructor === existing.constructor)
                throw new Error(`trying to add duplicate system of type '${system.constructor.name}'`);

        // submit system
        this.systems.add(system);

        // attach existing actors
        for (const actor of this.actors.items) {
            for (const component of actor.components) {
                // skip components in queue
                if (this.queue.has(component))
                    continue;

                // try to submit component
                if (system.match(component))
                    system.add(component);
            }
        }
    }

    /**
     * Create new actor instance and add it to a stage.
     * @param name - optional name of the actor.
     * @returns - new actor instance.
     */
    createActor(name?: string): Actor {
        const actor = new Actor() as Mutable<Actor>;
        if (name) actor.name = name;
        this.actors.add(actor);
        actor.stage = this;
        actor.active = true;
        actor.components = [];
        return actor as Actor;
    }

    /**
     * Add component of the given type to an actor.
     * @param actor - actor to whom add component.
     * @param type - type of the component to add.
     * @return component instance that was added.
     */
    addComponent<T>(actor: Actor, type: Newable<T>): T {
        if (this.destroyActors.has(actor))
            throw new Error("trying to add component to destroyed actor");

        // create component
        const component = new type() as T & Mutable<Component>;
        (actor.components as Component[]).push(component);
        this.queue.set(component, {enabled: false, started: false});

        // activate component
        component.actor = actor;
        Stage.invoke(component, "awake");
        return component;
    }

    /**
     * Remove component from a stage and from all related systems.
     * @param actor - actor from whom to remove component.
     * @param component - component to remove.
     */
    destroyComponent(actor: Actor, component: Component): void {
        // check if already destroying
        if (!this.destroyComponents.add(component))
            return;

        // find
        const components = actor.components as Component[];
        const index = components.indexOf(component);
        if (index < 0)
            throw new Error("component does not belong to given actor");

        // flags
        (component as Mutable<Component>).destroyed = true;

        // fill empty component slot
        Bag.removeAt(components, index);

        // remove from queue if it's there
        this.queue.delete(component);

        // remove from systems
        for (const system of this.systems.items)
            system.remove(component);

        // disable
        if (component.enabled) {
            (component as Mutable<Component>).enabled = false;
            Stage.invoke(component, "disable");
        }

        // destroy
        Stage.invoke(component, "destroy");
    }

    /**
     * Remove actor and all of its components from a stage.
     * @param actor - actor to remove.
     */
    destroyActor(actor: Actor) {
        // check if already destroying
        if (!this.destroyActors.add(actor))
            return;

        // remove from active actors
        this.actors.remove(actor);

        // flags
        (actor as Mutable<Actor>).active = false;
        (actor as Mutable<Actor>).destroyed = true;

        // callbacks
        for (const component of actor.components) {
            // remove from queue if it's there
            this.queue.delete(component);

            // remove from systems
            for (const system of this.systems.items)
                system.remove(component);

            // flags
            (component as Mutable<Component>).destroyed = true;

            // disable
            if (component.enabled) {
                (component as Mutable<Component>).enabled = false;
                Stage.invoke(component, "disable");
            }

            // destroy
            Stage.invoke(component, "destroy");
        }
    }

    /**
     * Find first occurrence of the component with given type.
     * @param type - type of the component to search for.
     * @return {T} - component instance if found; otherwise nothing.
     */
    findComponentOfType<T>(type: Newable<T>): T {
        for (const actor of this.actors.items)
            for (const component of actor.components)
                if (component instanceof type)
                    return component as any;
    }

    private tick(deltaTime: number) {
        // process components in queue
        this.queue.forEach(this.forEachInQueue, this);

        // tick systems
        for (const system of this.systems.items)
            system.tick(deltaTime);

        // destroy components
        for (const component of this.destroyComponents.items)
            (component as Mutable<Component>).actor = null;

        // destroy actors
        const {actors} = this;
        for (const actor of this.destroyActors.items) {
            // remove from an actor list
            actors.remove(actor);

            // set component refs to null
            for (const component of actor.components)
                (component as Mutable<Component>).actor = null;

            // set stage refs to null
            (actor as Mutable<Actor>).stage = null;
            (actor.components as Component[]).length = 0;
        }

        this.destroyActors.clear();
        this.destroyComponents.clear();
    }

    private forEachInQueue(state: QueueState, component: Component, queue: Map<Component, QueueState>) {
        // disabled just after awake or previously?
        if (component.enabled === false)
            return;

        // first enable?
        if (!state.enabled) {
            state.enabled = true;
            (component as Mutable<Component>).enabled = true;

            // submit to systems before enabling
            for (const system of this.systems.items)
                if (system.match(component))
                    system.add(component);

            Stage.invoke(component, "enable");
        }

        // disabled while 'enable' callback?
        if (!component.enabled)
            return;

        // first tick?
        if (!state.started) {
            state.started = true;
            Stage.invoke(component, "start");
        }

        // check if can be removed from queue
        if (state.enabled && state.started)
            queue.delete(component);
    }

    /**
     * Safely invoke function on a given instance.
     * @param object - instance that optionally has function to invoke.
     * @param key - name of the function.
     * @param args - arguments to pass to a function.
     */
    private static invoke<K extends string>(object: {[P in K]?: Function}, key: K, ...args: any[]) {
        try {
            if (object[key])
                object[key].apply(object, args);
        } catch (e) {
            console.error(e);
        }
    }
}
