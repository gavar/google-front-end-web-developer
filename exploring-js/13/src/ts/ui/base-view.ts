import {Actor, Component} from "$engine";
import {GameEvents} from "$game";
import {Draw2D} from "$systems";
import {Newable} from "@syntax";

/**
 * Base class for views which updates UI whenever some component has been modified.
 */
export abstract class BaseView implements Component, Draw2D {

    private dirty: boolean = true;

    /** @inheritDoc */
    public readonly actor: Actor;

    /** @inheritDoc */
    public readonly enabled: boolean;

    /** @inheritDoc */
    enable() {
        this.dirty = true;
    }

    /** Mark view as dirty to repaint in next frame. */
    setDirty(): void {
        this.dirty = true;
    }

    /** @inheritDoc */
    draw2D(): void {
        if (this.dirty) {
            this.dirty = false;
            this.render();
        }
    }

    /**
     * Listen for changes on the component.
     * Whenever the {@link GameEvents.PROPERTY_CHANGED} event occurs on a provided component,
     * this view will be automatically re-rendered.
     *
     * @param key - property on this instance storing component.
     * @param type - type of the component to find if not yet configured.
     * @return component of the given type.
     */
    protected listen<K extends keyof this, T extends Component>(this: this & Record<K, T>, key: K, type: Newable<T>): T {
        const component: T = this[key] as any || this.actor.stage.findComponentOfType(type);
        component.actor.on(GameEvents.PROPERTY_CHANGED, this.setDirty, this);
        this[key] = component as any;
        return component;
    }

    /** Render view */
    protected abstract render(): void;
}
