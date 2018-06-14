import {Mutable, Newable, With} from "@syntax";
import {Actor} from "./actor";
import {BagSet} from "./bag";
import {Component} from "./component";
import {System} from "./system";

/**
 * Main object of the ECS system which manages actors, components and systems.
 */
export class Stage {

    private static readonly buffer: any[] = [];

    private lastTime: number;
    private stepTime: number;
    private ticker: FrameRequestCallback;

    private readonly queue: BagSet<Component>;
    private readonly actors: BagSet<Mutable<Actor>>;
    private readonly systems: BagSet<System>;
    private readonly destroyActors: BagSet<Actor>;
    private readonly destroyComponents: BagSet<Component>;

    constructor() {
        this.queue = new BagSet<Component>();
        this.actors = new BagSet<Mutable<Actor>>();
        this.systems = new BagSet<System>();
        this.destroyActors = new BagSet<Actor>();
        this.destroyComponents = new BagSet<Component>();
        this.stepTime = 1 / 60; // 60 FPS
    }

    /** Start stage updates. */
    start(): void {
        this.lastTime = Date.now();
        this.ticker = () => {
            const now = Date.now();
            const deltaTime = (now - this.lastTime) * 0.001;
            if (deltaTime >= this.stepTime) {
                this.lastTime = now;
                this.tick(deltaTime);
            }
            window.requestAnimationFrame(this.ticker);
        };
        window.requestAnimationFrame(this.ticker);
    }

    /**
     * Add system to receive updates.
     * @param system - system to add.
     */
    addSystem(system: System) {
        this.systems.add(system);
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
        this.queue.add(component);

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
        const last = components.pop();
        if (last !== component)
            components[index] = last;

        // remove from queue if it's there
        this.queue.remove(component);

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

        // flags
        (actor as Mutable<Actor>).active = false;
        (actor as Mutable<Actor>).destroyed = true;

        // callbacks
        for (const component of actor.components) {
            // remove from queue if it's there
            this.queue.remove(component);

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

        const queue = this.queue.items;
        const systems = this.systems.items;

        try {
            const delay = Stage.buffer;
            // activate components
            for (const component of queue) {
                // disabled before first update?
                if (component.enabled === false) {
                    delay.push(component);
                }
                else {
                    (component as Mutable<Component>).enabled = true;
                    Stage.invoke(component, "enable");
                    Stage.invoke(component, "start");
                }
            }

            // register components to systems
            for (const component of queue)
                for (const system of systems)
                    if (component.enabled && system.match(component))
                        system.add(component);

            // refresh queue
            this.queue.clear();
            for (const component of delay)
                this.queue.add(component);
        }
        finally {
            Stage.buffer.length = 0;
        }

        // tick systems
        for (const system of systems)
            system.tick(deltaTime);

        // destroy components
        for (const component of this.destroyComponents.items)
            (component as Mutable<Component>).actor = null;

        // destroy actors
        for (const actor of this.destroyActors.items) {
            for (const component of actor.components)
                (component as Mutable<Component>).actor = null;

            (actor as Mutable<Actor>).stage = null;
            (actor.components as Component[]).length = 0;
        }

        this.destroyActors.clear();
        this.destroyComponents.clear();
    }

    /**
     * Safely invoke function on a given instance.
     * @param instance - instance that optionally has function to invoke.
     * @param key - name of the function.
     * @param args - arguments to pass to a function.
     */
    private static invoke<K extends string>(instance: Partial<With<K, Function>>, key: K, ...args: any[]) {
        try {
            if (instance[key])
                instance[key].apply(instance, args);
        } catch (e) {
            console.log(e);
        }
    }
}
