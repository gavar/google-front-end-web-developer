import {Actor} from "./actor";

export interface Component {

    /** Actor to whom this component belongs. */
    readonly actor?: Actor;

    /** Occurs just after component has been created. */
    awake?();

    /** Occurs before first component update. */
    start?();

    /** Occurs during component being removed from an actor. */
    destroy?();
}
