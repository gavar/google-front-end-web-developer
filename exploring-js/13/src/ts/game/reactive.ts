import {Actor, Component} from "$engine";
import {GameEvents} from "$game";

export class Reactive implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /**
     * Modify property of this object and emit {@link GameEvents#PROPERTY_CHANGED} if its value has been changed.
     * @param key - name of the property to modify.
     * @param value - new property value.
     * @return true if property has been changed; otherwise null.
     */
    set<K extends keyof this>(key: K, value: this[K]): boolean {
        if (this[key] === value)
            return false;

        this[key] = value;
        this.actor.emit(GameEvents.PROPERTY_CHANGED, this);
        return true;
    }
}
