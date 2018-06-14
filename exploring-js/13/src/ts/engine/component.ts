import {Mutable} from "@syntax";
import {Actor} from "./actor";

export interface Component {

    /** Actor to whom this component belongs. */
    readonly actor?: Actor;

    /**
     *  Whether component is enabled or not.
     *  Disabled components should not receive updates from system.
     */
    readonly enabled?: boolean;

    /** Whether component has been destroyed. */
    readonly destroyed?: boolean;

    /** Occurs just after component has been created. */
    awake?();

    /** Occurs just before component going to become enabled. */
    enable?();

    /** Occurs before first component update. */
    start?();

    /** Occurs just before component going to become disabled. */
    disable?();

    /** Occurs during component being removed from an actor. */
    destroy?();
}

export namespace Component {
    /**
     * Enable component if it's currently disabled.
     * @param component - component to enable.
     */
    export function enable(component: Mutable<Component>) {
        if (component && component.enabled === false) {
            component.enabled = true;
            component.enable && component.enable();
        }
    }

    /**
     * Disable component if it's currently enabled.
     * @param component - component to disable.
     */
    export function disable(component: Mutable<Component>) {
        if (component && component.enabled) {
            component.enabled = false;
            component.disable && component.disable();
        }
    }
}
