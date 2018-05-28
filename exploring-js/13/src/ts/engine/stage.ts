import {Mutable, Newable, With} from "@syntax";
import {Actor} from "./actor";
import {BagSet} from "./bag";
import {Component} from "./component";
import {System} from "./system";

/**
 * Main object of the ECS system which manages actors, components and systems.
 */
export class Stage {

    private lastTime: number;
    private stepTime: number;
    private ticker: FrameRequestCallback;

    private readonly queue: BagSet<Component>;
    private readonly actors: BagSet<StageActor>;
    private readonly systems: BagSet<System>;

    constructor() {
        this.queue = new BagSet<Component>();
        this.actors = new BagSet<StageActor>();
        this.systems = new BagSet<System>();
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
        const actor = new Actor() as StageActor;
        if (name) actor.name = name;
        this.actors.add(actor);
        actor.stage = this;
        actor.components = [];
        return actor;
    }

    /**
     * Add component of the given type to an actor.
     * @param actor - actor to whom add component.
     * @param type - type of the component to add.
     * @return component instance that was added.
     */
    addComponent<T>(actor: Actor, type: Newable<T>): T {
        // create component
        const component = new type() as T & Mutable<Component>;
        (actor as StageActor).components.push(component);
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
        const components = (actor as StageActor).components;

        // find
        const index = components.indexOf(component);
        if (index < 0)
            throw new Error("component does not belong to given actor");

        // fill empty component slot
        const last = components.pop();
        if (last !== component)
            components[index] = last;

        // remove from queue if it's there
        this.queue.remove(component);

        // remove from systems
        for (const system of this.systems.items)
            system.remove(component);

        // destroy
        Stage.invoke(component, "destroy");
        (component as StageComponent).actor = null;
    }

    /**
     * Remove actor and all of its components from a stage.
     * @param actor - actor to remove.
     */
    destroyActor(actor: Actor) {
        // do not allow to access components anymore
        const components = actor.components as StageComponent[];
        (actor as Mutable<Actor>).components = null;

        // destroy components
        for (const component of components) {
            // remove from queue if it's there
            this.queue.remove(component);

            // remove from systems
            for (const system of this.systems.items)
                system.remove(component);

            // destroy component
            Stage.invoke(component, "destroy");
            (component as StageComponent).actor = null;
        }

        // destroy actor
        (actor as Mutable<Actor>).stage = null;
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

        const systems = this.systems.items;
        const queue = this.queue.items;

        // activate components
        for (const component of queue)
            Stage.invoke(component, "start");

        // register components to systems
        for (const component of queue)
            for (const system of systems)
                if (system.match(component))
                    system.add(component);

        // clear queue
        this.queue.clear();

        // tick systems
        for (const system of systems)
            system.tick(deltaTime);
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

interface StageActor extends Mutable<Actor> {
    /** List of actor components. */
    components: Component[];
}

interface StageComponent extends Mutable<Component> {

}
