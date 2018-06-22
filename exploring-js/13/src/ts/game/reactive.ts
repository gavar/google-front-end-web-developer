import {Actor, Component} from "$/engine";
import {GameEvents} from "$/game";

export class Reactive implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /**
     * Set property of this object to a given value and emit {@link GameEvents#PROPERTY_CHANGED} if its value has been changed.
     * @param key - name of the property to modify.
     * @param value - new property value.
     * @return true if property has been changed; otherwise false.
     */
    set<K extends keyof this>(key: K, value: this[K]): boolean {
        if (this[key] === value)
            return false;

        this[key] = value;
        this.actor.emit(GameEvents.PROPERTY_CHANGED, this);
        return true;
    }

    /**
     * Modify property of this object by applying delta value and emit {@link GameEvents#PROPERTY_CHANGED} if its value has been changed.
     * @param key - name of the property to modify.
     * @param delta - delta value to apply to a current value.
     * @return true if property has been changed; otherwise false.
     */
    modify<K extends keyof this>(key: K, delta: this[K] & number): boolean {
        if (!delta)
            return false;

        this[key] += delta as any;
        this.actor.emit(GameEvents.PROPERTY_CHANGED, this);
        return true;
    }
}
