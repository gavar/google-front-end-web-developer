class Bag {
    /**
     * Remove item from a bag-like array.
     * When last item removed, returns false.
     * Otherwise, places a last item to a given index and returns true.
     *
     * @param items - bag-like array.
     * @param index - zero-based index of the item to remove.
     */
    static removeAt(items, index) {
        const last = items.pop();
        if (index >= items.length)
            return false;
        items[index] = last;
        return true;
    }
}

/**
 * Unordered list of unique items using O(1) for read / write operations.
 */
class BagSet {
    constructor() {
        this.array = [];
        this.indexer = new Map();
    }

    /** Unordered list of all items in a collection. */
    get items() {
        return this.array;
    }

    /** Number of items in a collection. */
    get size() {
        return this.array.length;
    }

    /**
     * Add item to collection.
     * @param item - item to add.
     * @return true if item successfully added; false if item already exists.
     */
    add(item) {
        if (this.indexer.has(item))
            return false;
        this.indexer.set(item, this.array.length);
        this.array.push(item);
        return true;
    }

    /**
     * Whether given item exists in the bag.
     * @param item - item to check.
     */
    has(item) {
        return this.indexer.has(item);
    }

    /**
     * Sort items in collection.
     * @param compare - function to use for comparing items.
     */
    sort(compare) {
        this.indexer.clear();
        this.array.sort(compare);
        for (let i = 0; i < this.array.length; i++)
            this.indexer.set(this.array[i], i);
    }

    /**
     * Remove item from collection.
     * @param item - item to remove.
     * @return true if item successfully removed; false if item was not found.
     */
    remove(item) {
        const index = this.indexer.get(item);
        if (typeof index === "undefined")
            return false;
        // remove from indexer
        this.indexer.delete(item);
        // fill empty slot with last component
        if (Bag.removeAt(this.array, index))
            this.indexer.set(this.array[index], index);
        return true;
    }

    /** Remove all items from a collection. */
    clear() {
        this.array.length = 0;
        this.indexer.clear();
    }
}

/**
 * Provides possibility produce and observe events.
 */
class EventEmitter {
    constructor() {
        this.lock = 0;
        this.bindings = [];
    }

    /**
     * Adds the {@param listener} function to the end of the listeners array for for the event identified by {@param type}.
     * Multiple calls with same combination of {@param type} and {@param listener} will result in the listener being added multiple times.
     * @param type - identifies the event to invoke listeners for.
     * @param listener - listener function to call whenever event occurs.
     * @param target - target to invoke listener on.
     */
    on(type, listener, target) {
        this.bindings.push({type, listener, target});
    }

    /**
     * Synchronously calls each of the listeners registered for the event identified by {@param type}.
     * Listener invocation occurs in the order they were registered, passing the supplied {@link event} to each.
     *
     * @param type - identifies the event to invoke listeners for.
     * @param event - event data to supply for each event listener.
     */
    emit(type, event) {
        // find index of first match
        let index = 0;
        for (; index < this.bindings.length; index++)
            if (this.bindings[index].type === type)
                break;
        // exit if no match
        if (index >= this.bindings.length)
            return;
        // initialize args
        const args = [event, type];
        // dispatch
        try {
            this.lock++;
            for (; index < this.bindings.length; index++) {
                const binding = this.bindings[index];
                if (binding.type === type)
                    binding.listener.apply(binding.target, args);
            }
        }
        finally {
            this.lock--;
            if (!this.lock)
                this.cleanup();
        }
    }

    /***
     * Removes listener previously registered for same event, callback and target.
     * @param type - identifies the event being removed.
     * @param listener - listener function to remove.
     * @param target - target of the listener function; if it's not given, only listener without target will be removed.
     */
    off(type, listener, target) {
        for (let i = 0; i < this.bindings.length; i++) {
            const binding = this.bindings[i];
            if (binding.type !== type)
                continue;
            if (binding.listener !== listener)
                continue;
            if (binding.target !== target)
                continue;
            this.bindings[i] = null;
        }
        if (!this.lock)
            this.cleanup();
    }

    /** Removes all events listeners. */
    removeAllListeners() {
        this.bindings.length = 0;
    }

    cleanup() {
        const {bindings} = this;
        for (let i = 0; i < bindings.length; i++) {
            if (bindings[i])
                continue;
            if (Bag.removeAt(bindings, i))
                i--;
        }
    }
}

class Component {
    /**
     * Enable component if it's currently disabled.
     * @param component - component to enable.
     */
    static enable(component) {
        if (component && component.enabled === false) {
            component.enabled = true;
            component.enable && component.enable();
        }
    }

    /**
     * Disable component if it's currently enabled.
     * @param component - component to disable.
     */
    static disable(component) {
        if (component && component.enabled) {
            component.enabled = false;
            component.disable && component.disable();
        }
    }

    /** Enabled and disable component in one frame. */
    static restart(component) {
        Component.disable(component);
        Component.enable(component);
    }
}

/**
 * Stage actor that can have behavioural components.
 */
class Actor extends EventEmitter {
    /** Initialize new instance of an actor. */
    constructor() {
        super();
        this.id = ++Actor.counter;
    }

    /**
     * Modify actor {@link active} state.
     * @param value - whether to set active or inactive.
     * @return true if state changed; false already has provided state.
     */
    setActive(value) {
        if (this.active === value)
            return false;
        if (value)
            this.alive();
        this.active = value;
        for (const component of this.components)
            value
                ? Component.enable(component)
                : Component.disable(component);
        return true;
    }

    /**
     * Add component of the given type to an actor.
     * @param type - type of component to add.
     * @returns - instance of added component.
     */
    add(type) {
        this.alive();
        return this.stage.addComponent(this, type);
    }

    /**
     * Find component of given type on this actor.
     * @param type - type of the component to search for.
     * @returns component of requested type on success; otherwise undefined.
     */
    get(type) {
        for (const component of this.components)
            if (component instanceof type)
                return component;
    }

    /**
     * Get or add component of the given type.
     * @param type - type of the component to find or create.
     * @returns - component instance of given type.
     */
    require(type) {
        return this.get(type) || this.add(type);
    }

    /**
     * Remove component from the actor.
     * @param component - component to remove.
     */
    remove(component) {
        this.stage.destroyComponent(this, component);
    }

    /**
     * Destroy this actor and all of its components.
     */
    destroy() {
        if (this.destroyed)
            return;
        this.emit(Actor.DESTROYING, this);
        this.stage.destroyActor(this);
        this.emit(Actor.DESTROYED, this);
        this.removeAllListeners();
    }

    /** Assert that this actor is alive. */
    alive() {
        if (this.destroyed)
            throw new Error("actor is destroyed!");
    }
}

Actor.DESTROYING = "destroying";
Actor.DESTROYED = "destroyed";
/** Number of actors created. */
Actor.counter = 0;
// 'Actor' defaults
Actor.prototype.name = "actor";

/**
 * System that process components of particular type.
 */
class ComponentSystem {
    constructor() {
        this.bag = new BagSet();
    }

    /**
     * Add component to a system.
     * @param component - component to add.
     */
    add(component) {
        this.bag.add(component);
    }

    /**
     * Remove component from a system.
     * @return component which has been removed.
     */
    remove(component) {
        this.bag.remove(component);
    }

    /**
     * Process each component in a system.
     * @param deltaTime - time since last call.
     */
    tick(deltaTime) {
        this.process(deltaTime, this.bag.items);
    }
}

/**
 * Main object of the ECS system which manages actors, components and systems.
 */
class Stage {
    constructor() {
        this.queue = new Map();
        this.actors = new BagSet();
        this.systems = new BagSet();
        this.destroyActors = new BagSet();
        this.destroyComponents = new BagSet();
    }

    /** Start stage updates. */
    start() {
        let lastTime;
        const stage = (time) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            this.tick(deltaTime / 1000);
            window.requestAnimationFrame(stage);
        };
        window.requestAnimationFrame((time) => {
            lastTime = time;
            window.requestAnimationFrame(stage);
        });
    }

    /**
     * Add system to receive updates.
     * @param system - system to add.
     */
    addSystem(system) {
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
    createActor(name) {
        const actor = new Actor();
        if (name)
            actor.name = name;
        this.actors.add(actor);
        actor.stage = this;
        actor.active = true;
        actor.components = [];
        return actor;
    }

    /**
     * Add component of the given type to an actor.
     * @param actor - actor to whom add component.
     * @param type - type of the component to add.
     * @return component instance that was added.
     */
    addComponent(actor, type) {
        if (this.destroyActors.has(actor))
            throw new Error("trying to add component to destroyed actor");
        // create component
        const component = new type();
        actor.components.push(component);
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
    destroyComponent(actor, component) {
        // check if already destroying
        if (!this.destroyComponents.add(component))
            return;
        // find
        const components = actor.components;
        const index = components.indexOf(component);
        if (index < 0)
            throw new Error("component does not belong to given actor");
        // flags
        component.destroyed = true;
        // fill empty component slot
        Bag.removeAt(components, index);
        // remove from queue if it's there
        this.queue.delete(component);
        // remove from systems
        for (const system of this.systems.items)
            system.remove(component);
        // disable
        if (component.enabled) {
            component.enabled = false;
            Stage.invoke(component, "disable");
        }
        // destroy
        Stage.invoke(component, "destroy");
    }

    /**
     * Remove actor and all of its components from a stage.
     * @param actor - actor to remove.
     */
    destroyActor(actor) {
        // check if already destroying
        if (!this.destroyActors.add(actor))
            return;
        // remove from active actors
        this.actors.remove(actor);
        // flags
        actor.active = false;
        actor.destroyed = true;
        // callbacks
        for (const component of actor.components) {
            // remove from queue if it's there
            this.queue.delete(component);
            // remove from systems
            for (const system of this.systems.items)
                system.remove(component);
            // flags
            component.destroyed = true;
            // disable
            if (component.enabled) {
                component.enabled = false;
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
    findComponentOfType(type) {
        for (const actor of this.actors.items)
            for (const component of actor.components)
                if (component instanceof type)
                    return component;
    }

    tick(deltaTime) {
        // process components in queue
        this.queue.forEach(this.forEachInQueue, this);
        // tick systems
        for (const system of this.systems.items)
            system.tick(deltaTime);
        // destroy components
        for (const component of this.destroyComponents.items)
            component.actor = null;
        // destroy actors
        const {actors} = this;
        for (const actor of this.destroyActors.items) {
            // remove from an actor list
            actors.remove(actor);
            // set component refs to null
            for (const component of actor.components)
                component.actor = null;
            // set stage refs to null
            actor.stage = null;
            actor.components.length = 0;
        }
        this.destroyActors.clear();
        this.destroyComponents.clear();
    }

    forEachInQueue(state, component, queue) {
        // disabled just after awake or previously?
        if (component.enabled === false)
            return;
        // first enable?
        if (!state.enabled) {
            state.enabled = true;
            component.enabled = true;
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
    static invoke(object, key, ...args) {
        try {
            if (object[key])
                object[key].apply(object, args);
        }
        catch (e) {
            console.error(e);
        }
    }
}
