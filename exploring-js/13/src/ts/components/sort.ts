import {Component} from "$engine";
import {Actor} from "$engine/actor";

/** Defines component for sorting actors on a stage. */
export class Sort implements Component {

    /** Actor to whom this component belongs. */
    public readonly actor?: Actor;

    /** Sorting layer value that indicates the sort order of this layer relative to the other layers. */
    public layer: number = 0;
}
