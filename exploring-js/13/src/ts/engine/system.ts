import {BagSet} from "$/engine";

/**
 * Represents system which process added components on each tick.
 */
export interface System<T = any> {

    /**
     * Whether system has ability to process given component.
     * @param component - component to check.
     */
    match(component: T): component is T;

    /**
     * Add component to a system.
     * @param component - component to add.
     */
    add(component: T): void;

    /**
     * Remove component from a system.
     * @return component which has been removed.
     */
    remove(component: T): void;

    /**
     * Process each component in a system.
     * @param deltaTime - time since last call.
     */
    tick(deltaTime: number): void;
}

/**
 * System that process components of particular type.
 */
export abstract class ComponentSystem<T = any> {

    protected bag: BagSet<T> = new BagSet<T>();

    /**
     * Whether system has ability to process given component.
     * @param component - component to check.
     */
    abstract match(component: T): component is T;

    /**
     * Add component to a system.
     * @param component - component to add.
     */
    add(component: T): void {
        this.bag.add(component);
    }

    /**
     * Remove component from a system.
     * @return component which has been removed.
     */
    remove(component: T): void {
        this.bag.remove(component);
    }

    /**
     * Process each component in a system.
     * @param deltaTime - time since last call.
     */
    tick(deltaTime: number): void {
        this.process(deltaTime, this.bag.items);
    }

    /**
     * Process list of components registered to a system.
     * @param deltaTime - time since last update call.
     * @param components - system components to process.
     */
    protected abstract process(deltaTime: number, components: ReadonlyArray<T>): void;
}
